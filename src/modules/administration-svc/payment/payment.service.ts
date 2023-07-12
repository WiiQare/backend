import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payer } from 'src/modules/payer-svc/entities/payer.entity';
import { Patient } from 'src/modules/patient-svc/entities/patient.entity';
import { Transaction } from 'src/modules/smart-contract/entities/transaction.entity';
import { Repository, DataSource } from 'typeorm';
import {
  PayerPaymentsDTO,
  ProviderPaymentsDTO,
  PaymentSummaryDTO,
} from './dto/payment.dto';

import { subMonths, subWeeks } from 'date-fns';
import { Provider } from 'src/modules/provider-svc/entities/provider.entity';
import {
  getCountPayerPaymentsQueryBuilder,
  getCountProviderPaymentsQueryBuilder,
} from './querybuilders/getCount.qb';
import { getCountryNameFromCode } from '../_common_';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private dataSource: DataSource,
  ) {}

  /**
   * This method is used to get global summary of payments
   * @returns
   */
  async getSummary(): Promise<PaymentSummaryDTO> {
    // total number of payer payments received within one week
    const payerPaymentsInOneWeek = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('COUNT(*)::integer', 'number')
      .addSelect('SUM(transaction.senderAmount)', 'value')
      .where("transaction.senderCurrency IN ('eur','EUR')")
      .andWhere('transaction.createdAt >= :datePrior', {
        datePrior: subWeeks(Date.now(), 1),
      })
      .getRawOne();
    // total number of payer payments received within one month
    const payerPaymentsInOneMonth = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('COUNT(*)::integer', 'number')
      .addSelect('SUM(transaction.senderAmount)', 'value')
      .where("transaction.senderCurrency IN ('eur','EUR')")
      .andWhere('transaction.createdAt >= :datePrior', {
        datePrior: subMonths(Date.now(), 1),
      })
      .getRawOne();
    // total number of payer payments received within three month
    const payerPaymentsInThreeMonth = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('COUNT(*)::integer', 'number')
      .addSelect('SUM(transaction.senderAmount)', 'value')
      .where("transaction.senderCurrency IN ('eur','EUR')")
      .andWhere('transaction.createdAt >= :datePrior', {
        datePrior: subMonths(Date.now(), 3),
      })
      .getRawOne();
    // total number of payer payments received within six months
    const payerPaymentsInSixMonth = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('COUNT(*)::integer', 'number')
      .addSelect('SUM(transaction.senderAmount)', 'value')
      .where("transaction.senderCurrency IN ('eur','EUR')")
      .andWhere('transaction.createdAt >= :datePrior', {
        datePrior: subMonths(Date.now(), 6),
      })
      .getRawOne();
    // total number of payer payments max
    const payerPaymentsMax = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('COUNT(*)::integer', 'number')
      .addSelect('SUM(transaction.senderAmount)', 'value')
      .where("transaction.senderCurrency IN ('eur','EUR')")
      .getRawOne();
    // total claimed vouchers
    const payerClaimedVouchers = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('COUNT(*)::integer', 'number')
      .addSelect('SUM(transaction.senderAmount)', 'value')
      .where("transaction.senderCurrency IN ('eur','EUR')")
      .andWhere(
        "transaction.ownerType = 'PROVIDER' AND transaction.status = 'CLAIMED'",
      )
      .getRawOne();

    // total provider payments
    const providerPayments = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('COUNT(transaction.voucher)::integer', 'number')
      .addSelect('SUM(transaction.senderAmount)', 'value')
      .where("transaction.senderCurrency IN ('eur','EUR')")
      .andWhere(
        "transaction.ownerType = 'PROVIDER' AND transaction.status = 'BURNED'",
      )
      .getRawOne();

    const { numberOfPayerPayments } = await getCountPayerPaymentsQueryBuilder(
      this.dataSource,
    ).getRawOne();

    const { numberOfProviderPayments } =
      await getCountProviderPaymentsQueryBuilder(this.dataSource).getRawOne();

    return {
      numberOFPayerPayments: numberOfPayerPayments || 0,
      numberOfProviderPayments: numberOfProviderPayments || 0,
      payerPaymentsInOneWeek: {
        numberOfPayments: payerPaymentsInOneWeek.number,
        value: payerPaymentsInOneWeek.value || 0,
      },
      payerPaymentsInOneMonth: {
        numberOfPayments: payerPaymentsInOneMonth.number,
        value: payerPaymentsInOneMonth.value || 0,
      },
      payerPaymentsInThreeMonths: {
        numberOfPayments: payerPaymentsInThreeMonth.number,
        value: payerPaymentsInThreeMonth.value || 0,
      },
      payerPaymentsInSixMonths: {
        numberOfPayments: payerPaymentsInSixMonth.number,
        value: payerPaymentsInSixMonth.value || 0,
      },
      payerPaymentsMax: {
        numberOfPayments: payerPaymentsMax.number,
        value: payerPaymentsMax.value || 0,
      },
      claimedVouchers: {
        numberOfPayments: payerClaimedVouchers.number,
        value: payerClaimedVouchers.value || 0,
      },

      totalProviderPayments: {
        numberOfPayments: providerPayments.number || 0,
        value: providerPayments.value || 0,
      },

      //TODO: to do later
      totalRevenue: 0,
    } as PaymentSummaryDTO;
  }

  /**
   * This method is used to retrieve list of payments received from payer
   * @returns
   */
  async getPaymentsFromPayer(take = 10, skip = 0): Promise<PayerPaymentsDTO[]> {
    const paymentsFromPayers = await this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndMapOne(
        'transaction.sender',
        Payer,
        'payer',
        'payer.user = transaction.senderId',
      )
      .leftJoinAndMapOne(
        'transaction.voucher',
        Patient,
        'patient',
        "patient.id = uuid((transaction.voucher)->>'patientId')",
      )
      .select([
        'transaction.id',
        'transaction.createdAt',
        'transaction.senderAmount',
        'payer.country',
        'patient.country',
      ])
      .where("transaction.senderCurrency IN ('eur','EUR')")
      .limit(take)
      .offset(skip)
      .getRawMany();

    return paymentsFromPayers.map((payment) => {
      const _country_payer = getCountryNameFromCode(payment.payer_country);
      const _country_beneficiary = getCountryNameFromCode(
        payment.patient_country,
      );
      return {
        transactionId: payment.transaction_id,
        transactionDate: new Date(
          payment.transaction_created_at,
        ).toLocaleDateString(),
        paymentValue: payment.transaction_sender_amount || 0,
        payerCountry: _country_payer || '',
        beneficiaryCountry: _country_beneficiary || '',
      };
    }) as PayerPaymentsDTO[];
  }

  /**
   * This method is used to retrieve list of payments due to provider.
   * @returns
   */
  async getPaymentsDueProvider(
    take = 10,
    skip = 0,
  ): Promise<ProviderPaymentsDTO[]> {
    const paymentsDueProvider = await this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndMapOne(
        'transaction.owner',
        Provider,
        'provider',
        'provider.id = transaction.ownerId',
      )
      .select([
        'transaction.id',
        'transaction.updatedAt',
        'provider.name',
        'provider.id',
        'provider.city',
        //'transaction.status',
        'transaction.amount',
        'transaction.senderAmount',
      ])
      .addSelect("provider.contact_person->>'country'", 'provider_country')
      .where("transaction.senderCurrency IN ('eur','EUR')")
      .andWhere(
        "transaction.ownerType = 'PROVIDER' AND transaction.status = 'UNCLAIMED'",
      )
      .limit(take)
      .offset(skip)
      .getRawMany();

    return paymentsDueProvider.map((payment) => {
      const _country_provider = getCountryNameFromCode(
        payment.provider_country,
      );
      return {
        transactionId: payment.transaction_id,
        transactionDate: new Date(
          payment.transaction_updated_at,
        ).toLocaleDateString(),
        providerName: payment.provider_name,
        providerId: payment.provider_id,
        providerCity: payment.provider_city,
        providerCountry: _country_provider != null ? _country_provider : '',
        //TODO : to do later
        //transactionStatus: payment.transaction_status === 'CLAIMED',
        voucherAmountInLocalCurrency: payment.transaction_amount,
        voucherAmountInSenderCurrency: payment.transaction_sender_amount,
      };
    }) as ProviderPaymentsDTO[];
  }
}
