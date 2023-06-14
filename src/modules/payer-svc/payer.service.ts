import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { customAlphabet } from 'nanoid';
import { _400, _403, _404 } from 'src/common/constants/errors';
import { Repository } from 'typeorm';
import { SALT_ROUNDS } from '../../common/constants/constants';
import { InviteType, UserRole, UserStatus } from '../../common/constants/enums';
import { MailService } from '../mail/mail.service';
import { Patient } from '../patient-svc/entities/patient.entity';
import { JwtClaimsDataDto } from '../session/dto/jwt-claims-data.dto';
import { User } from '../session/entities/user.entity';
import { Transaction } from '../smart-contract/entities/transaction.entity';
import { SmsService } from '../sms/sms.service';
import { CreatePayerAccountDto, SendInviteDto } from './dto/payer.dto';
import { Payer } from './entities/payer.entity';

@Injectable()
export class PayerService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(Payer)
    private readonly payerRepository: Repository<Payer>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly mailService: MailService,
    private readonly smsService: SmsService,
  ) {}

  /**
   * This function retrieve payer account related by Entity Id
   *
   * @param payerId
   */
  async findPayerById(payerId: string): Promise<Payer> {
    return this.payerRepository.findOne({
      where: {
        id: payerId,
      },
      relations: {
        user: true,
      },
    });
  }

  /**
   * This function retrieve payer account related to a user account
   *
   * @param userId
   */
  async findPayerByUserId(userId: string): Promise<Payer> {
    return this.payerRepository.findOne({
      where: {
        user: {
          id: userId,
        },
      },
    });
  }

  /**
   * This function is used to created Payer account on wiiQrare
   *
   */
  async registerNewPayerAccount(
    payload: CreatePayerAccountDto,
  ): Promise<Payer> {
    const { phoneNumber, email, firstName, lastName, password, country } =
      payload;

    const hashedPassword = bcrypt.hashSync(password, SALT_ROUNDS);

    const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10);

    const referralCode = `REF-${nanoid(6)}`; //=> "REF-f01a2f"

    const payerToBeCreated = this.payerRepository.create({
      user: {
        phoneNumber: phoneNumber,
        email: email,
        password: hashedPassword,
        role: UserRole.PAYER,
        status: UserStatus.ACTIVE,
      },
      firstName: firstName,
      lastName: lastName,
      country,
      referralCode,
    });
    return this.payerRepository.save(payerToBeCreated);
  }

  /**
   * This method is used to send invite to friend to join wiiqare
   *
   */
  async sendInviteToFriend(
    sendInviteDto: SendInviteDto,
    authUser: JwtClaimsDataDto,
  ): Promise<void> {
    const { inviteType, emails, phoneNumbers } = sendInviteDto;

    const inviteFromUser = await this.payerRepository
      .createQueryBuilder('payer')
      .leftJoinAndSelect('payer.user', 'user')
      .where('user.id = :userId', { userId: authUser.sub })
      .getOne();

    if (!inviteFromUser) throw new NotFoundException(_404.USER_NOT_FOUND);

    if (inviteType === InviteType.EMAIL && emails.length == 0)
      throw new BadRequestException(_400.EMAIL_REQUIRED);

    if (inviteType === InviteType.SMS && phoneNumbers.length == 0)
      throw new BadRequestException(_400.PHONE_NUMBER_REQUIRED);

    if (inviteType === InviteType.EMAIL && emails.length > 0) {
      await this.mailService.sendInviteEmail(
        emails,
        authUser.names,
        inviteFromUser.referralCode,
      );
    }

    if (inviteType === InviteType.SMS && phoneNumbers.length > 0) {
      await this.sendSMSInviteToFriend(
        phoneNumbers,
        authUser.names,
        inviteFromUser.referralCode,
      );
    }
  }

  /**
   * This function is used to send SMS Invite to friend by phone numbers
   */
  async sendSMSInviteToFriend(
    phoneNumbers: string[],
    names: string,
    referralCode: string,
  ): Promise<void> {
    return this.smsService.sendSmsTOFriend(phoneNumbers, names, referralCode);
  }

  /**
   * This function is used to send voucher by SMS
   *
   */
  async sendSmsVoucher(
    shortenHash: string,
    authUser: JwtClaimsDataDto,
  ): Promise<void> {
    const [payer, transaction] = await Promise.all([
      this.payerRepository
        .createQueryBuilder('payer')
        .leftJoinAndSelect('payer.user', 'user')
        .where('user.id = :userId', { userId: authUser.sub })
        .getOne(),
      this.transactionRepository.findOne({ where: { shortenHash } }),
    ]);

    if (!payer) throw new NotFoundException(_404.PAYER_NOT_FOUND);

    if (!transaction)
      throw new NotFoundException(_404.INVALID_TRANSACTION_HASH);

    if (transaction.senderId !== authUser.sub)
      throw new ForbiddenException(_403.ONLY_OWNER_CAN_SEND_VOUCHER);

    const patient = await this.patientRepository.findOne({
      where: { id: transaction.ownerId },
    });

    if (!patient) throw new NotFoundException(_404.PATIENT_NOT_FOUND);

    await this.smsService.sendVoucherAsAnSMS(
      transaction.shortenHash,
      patient.phoneNumber,
      authUser.names,
      transaction.amount,
      transaction.currency,
    );
  }
}
