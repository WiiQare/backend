import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as _ from 'lodash';
import { APP_NAME, DAY, HOUR } from '../../common/constants/constants';
import {
  UserRole,
  UserStatus,
  UserType,
  VoucherStatus,
} from '../../common/constants/enums';
import { _403, _404 } from '../../common/constants/errors';
import { generateToken, randomSixDigit } from '../../helpers/common.helper';
import { Repository } from 'typeorm';
import { CachingService } from '../caching/caching.service';
import { MailService } from '../mail/mail.service';
import { ObjectStorageService } from '../object-storage/object-storage.service';
import { Patient } from '../patient-svc/entities/patient.entity';
import { User } from '../session/entities/user.entity';
import { Transaction } from '../smart-contract/entities/transaction.entity';
import { SmsService } from '../sms/sms.service';
import {
  AddServiceToPackageDto,
  ContactPersonDto,
  CreatePackageDto,
  CreateServiceDto,
  ProviderValidateEmailDto,
  RegisterProviderDto,
} from './dto/provider.dto';
import { Package } from './entities/package.entity';
import { Provider } from './entities/provider.entity';
import { Service } from './entities/service.entity';

@Injectable()
export class ProviderService {
  constructor(
    @InjectRepository(Provider)
    private readonly providerRepository: Repository<Provider>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Package)
    private packageRepository: Repository<Package>,
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
    private objectStorageService: ObjectStorageService,
    private cachingService: CachingService,
    private mailService: MailService,
    private smsService: SmsService,
  ) {}

  /**
   * This function retrieve provider account related by the provider id
   *
   * @param userId
   */
  async findProviderByUserId(userId: string): Promise<Provider> {
    return this.providerRepository.findOne({
      where: {
        user: { id: userId },
      },
    });
  }

  async providerVerifyEmail(payload: ProviderValidateEmailDto): Promise<void> {
    const { email, password } = payload;
    // generate random reset password token
    const verifyToken = generateToken();

    // save reset token in cache
    const cacheToken = `${APP_NAME}:email:${verifyToken}`;

    const dataToSave: { email: string; password: string } = {
      email,
      password,
    };

    // cache key with 1 day ttl
    await this.cachingService.save<{ email: string; password: string }>(
      cacheToken,
      dataToSave,
      DAY,
    );

    // send email to the user
    await this.mailService.sendProviderVerificationEmail(email, verifyToken);
  }

  async registerNewProvider(
    logo: Express.Multer.File,
    payload: RegisterProviderDto,
  ): Promise<Record<string, any>> {
    const {
      name,
      address,
      businessRegistrationNo,
      nationalId,
      businessType,
      phone,
      city,
      postalCode,
      emailVerificationToken,
    } = payload;

    const contactPerson = {
      email: payload?.contactPersonEmail,
      country: payload?.contactPersonCountry,
      firstName: payload?.contactPersonFirstName,
      lastName: payload?.contactPersonLastName,
      homeAddress: payload?.contactPersonHomeAddress,
      phone: payload?.contactPersonPhone,
      occupation: payload?.contactPersonOccupation,
    } as ContactPersonDto;

    const result = await this.objectStorageService.saveObject(logo);

    // Get the email and user of the creator!.
    const cacheToken = `${APP_NAME}:email:${emailVerificationToken}`;

    const dataCached: { email: string; password: string } =
      await this.cachingService.get<{
        email: string;
        password: string;
      }>(cacheToken);
    if (!dataCached)
      throw new ForbiddenException(_403.INVALID_EMAIL_VERIFICATION_TOKEN);

    const { email, password } = dataCached;

    const hashedPassword = bcrypt.hashSync(password, 10);

    // TODO: use transaction to save both user and provider!
    const provider = await this.providerRepository.save({
      email,
      logoLink: 'https://google.com/logo',
      name,
      address,
      businessRegistrationNo,
      nationalId,
      businessType,
      phone,
      city,
      postalCode,
      emailVerificationToken,
      contactPerson,
      user: {
        email,
        password: hashedPassword,
        phoneNumber: phone,
        role: UserRole.PROVIDER,
        status: UserStatus.INACTIVE,
      },
    });

    return {
      id: provider.id,
      providerName: provider.name,
      address: provider.address,
      businessType: provider.businessType,
      businessRegistrationNo: provider.businessRegistrationNo,
      city: provider.city,
      email: provider.email,
    };
  }

  /**
   * This method is used by the system to send verification OTP to patient to authorize the transfer of the voucher to provider
   *
   * @param shortenHash
   * @param patient
   * @param transaction
   */
  async sendTxVerificationOTP(
    shortenHash: string,
    patient: Patient,
    transaction: Transaction,
  ): Promise<void> {
    // generate random reset password token
    const verifyToken = randomSixDigit();
    // save reset token in cache
    const cacheToken = `${APP_NAME}:transaction:${shortenHash}`;
    await this.cachingService.save<string>(cacheToken, verifyToken, HOUR);

    // send SMS to the patient
    await this.smsService.sendTransactionVerificationTokenBySmsToAPatient(
      verifyToken,
      patient.phoneNumber,
      transaction.amount,
    );
  }

  /**
   * Get short details about the transaction
   * @param shortenHash
   */
  async getTransactionByShortenHash(
    shortenHash: string,
  ): Promise<Record<string, any>> {
    const transaction = await this.transactionRepository.findOne({
      where: { shortenHash, ownerType: UserType.PATIENT },
    });

    if (!transaction)
      throw new NotFoundException(_404.INVALID_TRANSACTION_HASH);

    const patient = await this.patientRepository.findOne({
      where: { id: transaction.ownerId },
    });

    if (!patient) throw new NotFoundException(_404.PATIENT_NOT_FOUND);

    await this.sendTxVerificationOTP(shortenHash, patient, transaction);

    return {
      hash: transaction.transactionHash,
      shortenHash: transaction.shortenHash,
      amount: transaction.amount,
      currency: transaction.currency,
      patientNames: `${patient.firstName} ${patient.lastName}`,
      patientPhoneNumber: patient.phoneNumber,
    };
  }

  /**
   * This method is used by the system to authorize the transfer of the voucher to provider
   *
   * @param shortenHash
   * @param providerId
   * @param securityCode
   * @returns {Promise<Record<string, any>>}
   */
  async authorizeVoucherTransfer(
    shortenHash: string,
    providerId: string,
    securityCode: string,
  ): Promise<Record<string, any>> {
    // verify the transaction exists and if securityCode is right!
    const [transaction, provider] = await Promise.all([
      this.transactionRepository.findOne({
        where: { shortenHash, ownerType: UserType.PATIENT },
      }),
      this.providerRepository.findOne({ where: { id: providerId } }),
    ]);

    if (!transaction)
      throw new NotFoundException(_404.INVALID_TRANSACTION_HASH);

    if (!provider) throw new NotFoundException(_404.PROVIDER_NOT_FOUND);

    const cacheToken = `${APP_NAME}:transaction:${shortenHash}`;
    const savedSecurityCode = await this.cachingService.get<string>(cacheToken);

    if (securityCode !== savedSecurityCode)
      throw new ForbiddenException(
        _403.INVALID_VOUCHER_TRANSFER_VERIFICATION_CODE,
      );

    // transfer voucher from patient to provider
    //Update the voucher on block-chain

    // Update the transaction in the database
    const updatedTransaction = await this.transactionRepository.save({
      ...transaction,
      ownerType: UserType.PROVIDER,
      ownerId: providerId,
    });

    return {
      code: 200,
      message: 'Voucher transfer authorized successfully',
    };
  }

  /**
   * This method is used to retrieve all transactions for a given
   * Provider
   * @param providerId
   *
   */
  async getAllTransactions(providerId: string): Promise<Record<string, any>[]> {
    const transactions = await this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.ownerId = :providerId', { providerId })
      .getMany();
    //TODO: paginate this!.
    return transactions;
  }

  /**
   * This method is used to statistic about transactions
   * @param providerId
   *
   */
  async getTransactionStatistic(
    providerId: string,
  ): Promise<Record<string, any>> {
    const transactions = await this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.ownerId = :providerId', { providerId })
      .getMany();

    let totalRedeemedAmount = 0,
      totalPendingAmount = 0,
      totalUnclaimedAmount = 0;

    transactions.forEach((transaction) => {
      if (transaction.status === VoucherStatus.PENDING)
        totalPendingAmount += transaction.amount;
      if (transaction.status === VoucherStatus.CLAIMED)
        totalRedeemedAmount += transaction.amount;
      if (transaction.status === VoucherStatus.UNCLAIMED)
        totalUnclaimedAmount += transaction.amount;
    });

    return {
      totalAmount: _.sumBy(transactions, 'amount'),
      totalUniquePatients: _.uniqBy(transactions, 'voucher.patientId').length,
      totalRedeemedAmount,
      totalPendingAmount,
      totalUnclaimedAmount,
    };
  }

  /**
   * This method is used to redeem voucher
   *
   */
  async redeemVoucher(hashes: string[]): Promise<Record<string, any>[]> {
    const transactions = await this.transactionRepository
      .createQueryBuilder('transaction')
      .where(`transaction.transactionHash In (:...hashes)`, { hashes })
      .andWhere(`transaction.status = :status`, {
        status: VoucherStatus.UNCLAIMED,
      })
      .getMany();

    // update transactions status to pending!.

    const updatedTransactionList = transactions.map((transaction) => ({
      ...transaction,
      status: VoucherStatus.PENDING,
    }));

    //TODO: update the voucher details on chain.
    return this.transactionRepository.save(updatedTransactionList);
  }

  // Add service to provider
  async addServiceToProvider(payload: CreateServiceDto): Promise<Service> {
    const provider = await this.providerRepository.findOne({
      where: { id: payload.providerId },
    });

    if (!provider) throw new ForbiddenException(_404.PROVIDER_NOT_FOUND);

    // Create new service
    let service = new Service();
    service.name = payload.name;
    service.description = payload.description;
    service.price = payload.price;
    service.provider = provider;

    // Save service
    service = await this.servicesRepository.save(service);
    return service
  }

  // Get services of provider
  async getServicesByProviderId(providerId: string): Promise<Service[]> {

    const services = await this.servicesRepository.find({
      where: {provider: {id: providerId}},
      relations: ['provider'],
      select: ['id', 'createdAt', 'description', 'price', 'name']
    });

    return services;
  }

  // Add package to provider
  async addPackageToProvider(payload: CreatePackageDto): Promise<Package> {
    const provider = await this.providerRepository.findOne({
      where: { id: payload.providerId },
    });

    if (!provider) throw new ForbiddenException(_404.PROVIDER_NOT_FOUND);

    // Create new package
    let newPackage = new Package();
    newPackage.name = payload.name;
    newPackage.description = payload.description;
    newPackage.price = payload.price;
    newPackage.provider = provider;
    newPackage.services = payload.services;

    // Save package
    newPackage = await this.packageRepository.save(newPackage);
    return newPackage
  }

  // Get services of provider
  async getPackagesByProviderId(providerId: string): Promise<Package[]> {

    const packages = await this.packageRepository.find({
      where: {provider: {id: providerId}},
      relations: ['provider', 'services']
    });

    return packages;
  }

  // Group services into package
  async addServiceToPackage(payload: AddServiceToPackageDto): Promise<void> {
    const provider = await this.providerRepository.findOne({
      where: { id: payload.providerId },
    });

    if (!provider) throw new ForbiddenException(_404.PROVIDER_NOT_FOUND);

    // Find package
    const pkg = await this.packageRepository.findOne({
      where: { id: payload.package.id },
    });

    if (!pkg) throw new ForbiddenException(_404.PACKAGE_NOT_FOUND);

    // Create and save new services
    const services = await Promise.all(
      payload.services.map(async (serviceDto) => {
        let service = new Service();
        service.name = serviceDto.name;
        service.description = serviceDto.description;
        service.price = serviceDto.price;
        service.provider = provider;

        return await this.servicesRepository.save(service);
      }),
    );

    // Add services to package
    pkg.services.push(...services);

    // Save package
    await this.packageRepository.save(pkg);
  }

  async listProvider(): Promise<any> {

    let providers = await this.providerRepository.createQueryBuilder('providers')
    .leftJoinAndSelect('providers.packages', 'packages')
    .getMany();

    return providers
  }
}
