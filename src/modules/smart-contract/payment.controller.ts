import {
  Body,
  Controller,
  Get,
  Headers,
  NotFoundException,
  Post,
  Query,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import _ from 'lodash';
import { InjectStripe } from 'nestjs-stripe';
import {
  ReceiverType,
  SenderType,
  TransactionStatus,
  UserRole,
  VoucherStatus,
} from 'src/common/constants/enums';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/user-role.decorator';
import { logError, logInfo } from 'src/helpers/common.helper';
import { Stripe } from 'stripe';
import { Repository } from 'typeorm';
import { AppConfigService } from '../../config/app-config.service';
import { Patient } from '../patient-svc/entities/patient.entity';
import { Payer } from '../payer-svc/entities/payer.entity';
import { JwtClaimsDataDto } from '../session/dto/jwt-claims-data.dto';
import { Transaction } from './entities/transaction.entity';
import { SmartContractService } from './smart-contract.service';
import { TransactionService } from './transaction.service';
import { _400 } from 'src/common/constants/errors';
import { Voucher } from './entities/voucher.entity';
import { operationService } from '../operation-saving/operation.service';
import { OperationType } from '../operation-saving/entities/operation.entity';

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
  constructor(
    @InjectStripe() private readonly stripe: Stripe,
    private readonly appConfigService: AppConfigService,
    private readonly smartContractService: SmartContractService,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,
    private readonly transactionService: TransactionService,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      'This API list all transaction history or specific payer transactions',
  })
  @Roles(UserRole.WIIQARE_ADMIN, UserRole.WIIQARE_MANAGER, UserRole.PAYER)
  async getPaymentHistory(
    @AuthUser() authUser: JwtClaimsDataDto,
  ): Promise<Transaction[]> {
    if (authUser.type === UserRole.PAYER) {
      return this.transactionService.getTransactionHistoryBySenderId(
        authUser.sub,
      );
    }
    return this.transactionService.getAllTransactionHistory();
  }

  @Post('notification')
  @Public()
  @ApiOperation({
    summary: 'This API receive payment notification from stripe[webhook]',
  })
  async handlePaymentWebhookEvent(
    @Headers('stripe-signature') signature: string,
    @Body() event: Stripe.Event,
    @Req() req: RawBodyRequest<Request>,
  ) {
    try {
      // Verify the webhook event with Stripe to ensure it is authentic
      const webhookSecret = this.appConfigService.stripeWebHookSecret;

      console.log(webhookSecret);

      const verifiedEvent = this.stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        webhookSecret,
      );

      // Handle the event based on its type
      switch (verifiedEvent.type) {
        case 'payment_intent.succeeded':
          // Update the relevant database record to indicate that the payment succeeded
          logInfo(`Payment succeeded for payment intent ${verifiedEvent}`);

          const {
            id: stripePaymentId,
            amount: senderAmount,
            currency: senderCurrency,
          } = verifiedEvent.data.object as Stripe.PaymentIntent;

          const { metadata } = verifiedEvent.data.object as unknown as Record<
            string,
            any
          >;

          //TODO: Please use our own BE exchange rate API to get the latest exchange rate!!
          const {
            senderId,
            patientId,
            currencyPatientAmount,
            currencyPatient,
            currencyRate,
          } = metadata;

          const voucherData = await this.smartContractService.mintVoucher({
            amount: Math.round(currencyPatientAmount),
            ownerId: patientId,
            currency: currencyPatient,
            patientId: patientId,
          });

          const voucherJSON = {
            id: _.get(voucherData, 'events.mintVoucherEvent.returnValues.0'),
            amount: _.get(
              voucherData,
              'events.mintVoucherEvent.returnValues.1.[0]',
            ),
            currency: _.get(
              voucherData,
              'events.mintVoucherEvent.returnValues.1.[1]',
            ),
            ownerId: _.get(
              voucherData,
              'events.mintVoucherEvent.returnValues.1.[2]',
            ),
            hospitalId: _.get(
              voucherData,
              'events.mintVoucherEvent.returnValues.1.[3]',
            ),
            patientId: _.get(
              voucherData,
              'events.mintVoucherEvent.returnValues.1.[4]',
            ),
            status: _.get(
              voucherData,
              'events.mintVoucherEvent.returnValues.1.[5]',
            ),
          };

          const transactionHash = _.get(
            voucherData,
            'events.mintVoucherEvent.transactionHash',
          );

          const shortenHash = transactionHash.slice(0, 8);

          const transactionToSave = this.transactionRepository.create({
            senderAmount: senderAmount / 100,
            senderCurrency: senderCurrency.toUpperCase(),
            amount: Math.round(currencyPatientAmount),
            currency: currencyPatient,
            conversionRate: currencyRate,
            senderId,
            ownerId: patientId,
            stripePaymentId,
            voucher: voucherJSON,
            status: TransactionStatus.PENDING,
          });
          const savedTransaction = await this.transactionRepository.save(
            transactionToSave,
          );

          // update this
          const voucherToSave = this.voucherRepository.create({
            voucherHash: transactionHash,
            shortenHash: shortenHash,
            value: currencyPatientAmount,
            senderId: senderId,
            senderType: SenderType.PAYER,
            receiverId: patientId,
            receiverType: ReceiverType.PATIENT,
            status: VoucherStatus.UNCLAIMED,
            transaction: savedTransaction.id,
          });
          await this.voucherRepository.save(voucherToSave);

          break;
        case 'payment_intent.payment_failed':
          // Handle the failure in some way
          break;
        default:
          logInfo(`Unhandled Stripe event type: ${verifiedEvent.type}`);
      }
    } catch (err) {
      logError(`Error processing webhook event: ${err}`);
      return { error: 'Failed to process webhook event' };
    }
  }

  @Get('voucher')
  @Public()
  @ApiOperation({ summary: 'This API retrieve voucher by payment id' })
  async retrieveVoucherByPaymentId(
    @Query('paymentId') paymentId: string,
  ): Promise<any> {
    let transaction = await this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndMapOne(
        'transaction.sender',
        Payer,
        'payer',
        'payer.user = transaction.senderId',
      )
      .leftJoinAndMapOne(
        'transaction.patient',
        Patient,
        'patient',
        'patient.id = transaction.ownerId',
      )
      .leftJoinAndMapOne(
        'transaction.voucherEntity',
        Voucher,
        'voucherEntity',
        'voucherEntity.transaction = transaction.id',
      )
      .select([
        'transaction',
        'payer.firstName',
        'payer.lastName',
        'payer.country',
        'patient.firstName',
        'patient.lastName',
        'patient.phoneNumber',
        'voucherEntity',
      ])
      .where('transaction.stripePaymentId = :paymentId', { paymentId })
      .getOne();

    if (!transaction) throw new NotFoundException('Resource not found');

    return transaction;
  }
}
