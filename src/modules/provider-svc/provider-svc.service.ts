import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as _ from 'lodash';
import { APP_NAME, DAY, HOUR } from '../../common/constants/constants';
import {
  ReceiverType,
  SenderType,
  TransactionStatus,
  UserRole,
  UserStatus,
  UserType,
  VoucherStatus,
} from '../../common/constants/enums';
import { _403, _404 } from '../../common/constants/errors';
import { convertCurrency, generateToken, randomSixDigit } from '../../helpers/common.helper';
import { In, Repository } from 'typeorm';
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
import { Voucher } from '../smart-contract/entities/voucher.entity';
import { SmartContractService } from '../smart-contract/smart-contract.service';
import Web3 from 'web3';

@Injectable()
export class ProviderService {
  private web3: Web3;

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
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,
    private objectStorageService: ObjectStorageService,
    private cachingService: CachingService,
    private mailService: MailService,
    private smsService: SmsService,
    private contractService: SmartContractService,
  ) {

  }

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
    const voucher: any = await this.voucherRepository.findOne({
      where: { shortenHash },
      relations: ['transaction'],
    });
    console.log(voucher);
    if (voucher.transaction.hospitalId) {
      console.log('invalid vouch');
      throw new NotFoundException(_404.VOUCHER_USED);
    }

    if (!voucher.transaction)
      throw new NotFoundException(_404.INVALID_TRANSACTION_HASH);

    const patient = await this.patientRepository.findOne({
      where: { id: voucher?.transaction?.ownerId },
    });

    if (!patient) throw new NotFoundException(_404.PATIENT_NOT_FOUND);

    await this.sendTxVerificationOTP(shortenHash, patient, voucher.transaction);

    return {
      hash: voucher.voucherHash,
      shortenHash: voucher.shortenHash,
      amount: voucher.transaction.amount,
      currency: voucher.transaction.currency,
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
    serviceIds: string[],
    total: number
  ): Promise<Record<string, any>> {
    // verify the transaction exists and if securityCode is right!
    const voucher = await this.voucherRepository.findOne({
      where: { shortenHash },
      relations: ['transaction'],
    });
    const [transaction, provider, services ] = await Promise.all([
      this.transactionRepository.findOne({
        where: { id: voucher.transaction.id, ownerType: ReceiverType.PATIENT },
      }),
      this.providerRepository.findOne({ where: { id: providerId } }),
      this.servicesRepository.find({ where: { id: In( serviceIds )}} )
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
    
    //compute total price of services ( hospital currency )
    const serviceTotal = services.reduce( ( acc, el ) => { acc += parseInt( el.price.toString() ); return acc; }, 0 );
    if( transaction.currency !== 'CDF'){
      throw new ForbiddenException(
        _403.WRONG_VOUCHER_CURRENCY
      );
    }

    const voucherValueInCDF = voucher.value;

    // console.log('aight', serviceTotal, voucher.value, voucher.vid );
    //if services value is smaller than voucher
    const threshold = 0.1;
    // console.log('web3 aight', Web3.utils.toWei( serviceTotal.toString(), 'ether' ) );
    if( (voucherValueInCDF - serviceTotal) > voucherValueInCDF*threshold ){
      
      // uint256 value;
      // string currencySymbol;
      // string ownerID;
      // string providerID;
      // string beneficiaryID;
      // string status;

      const firstVoucher = {
        amount: serviceTotal,
        ownerId: transaction.senderId,
        currency: 'CDF',
        patientId: transaction.ownerId
      }

      const secondVoucher = {
        amount: (voucherValueInCDF - serviceTotal),
        ownerId: transaction.senderId,
        currency: 'CDF',
        patientId: transaction.ownerId
      }

      // console.log('vouchers', firstVoucher[0], secondVoucher[0] );

      //split voucher -- update this when contract bug is fixed
      // const voucherData = await this.contractService.splitVoucher(
      //   voucher.voucherHash,
      //   firstVoucher,
      //   secondVoucher
      // );

      // console.log( 'data', voucherData );

      //burn voucher
      const burnedData = await this.contractService.burnVoucher( voucher.vid );

      //mint new vouchers
      const firstSplitVoucher = await this.contractService.mintVoucher( firstVoucher );
      const secondSplitVoucher = await this.contractService.mintVoucher( secondVoucher );

      const firstVoucherJSON = {
        id: _.get(firstSplitVoucher, 'events.mintVoucherEvent.returnValues.0'),
        amount: _.get(
          firstSplitVoucher,
          'events.mintVoucherEvent.returnValues.1.[0]',
        ),
        currency: _.get(
          firstSplitVoucher,
          'events.mintVoucherEvent.returnValues.1.[1]',
        ),
        ownerId: _.get(
          firstSplitVoucher,
          'events.mintVoucherEvent.returnValues.1.[2]',
        ),
        hospitalId: _.get(
          firstSplitVoucher,
          'events.mintVoucherEvent.returnValues.1.[3]',
        ),
        patientId: _.get(
          firstSplitVoucher,
          'events.mintVoucherEvent.returnValues.1.[4]',
        ),
        status: _.get(
          firstSplitVoucher,
          'events.mintVoucherEvent.returnValues.1.[5]',
        ),
      };
      const firstTransactionHash = _.get(
        firstSplitVoucher,
        'events.mintVoucherEvent.transactionHash',
      );
      const firstShortenHash = firstTransactionHash.slice(0, 8);

      const secondVoucherJSON = {
        id: _.get(secondSplitVoucher, 'events.mintVoucherEvent.returnValues.0'),
        amount: _.get(
          secondSplitVoucher,
          'events.mintVoucherEvent.returnValues.1.[0]',
        ),
        currency: _.get(
          secondSplitVoucher,
          'events.mintVoucherEvent.returnValues.1.[1]',
        ),
        ownerId: _.get(
          secondSplitVoucher,
          'events.mintVoucherEvent.returnValues.1.[2]',
        ),
        hospitalId: _.get(
          secondSplitVoucher,
          'events.mintVoucherEvent.returnValues.1.[3]',
        ),
        patientId: _.get(
          secondSplitVoucher,
          'events.mintVoucherEvent.returnValues.1.[4]',
        ),
        status: _.get(
          secondSplitVoucher,
          'events.mintVoucherEvent.returnValues.1.[5]',
        ),
      };
      const secondTransactionHash = _.get(
        secondSplitVoucher,
        'events.mintVoucherEvent.transactionHash',
      );
      const secondShortenHash = secondTransactionHash.slice(0, 8);
      

      const updatedTransaction = await this.transactionRepository.save({
        ...transaction,
        ownerType: ReceiverType.PROVIDER,
        hospitalId: null,
        status: TransactionStatus.SPLIT
      });
      const updatedVoucher = await this.voucherRepository.save({
        ...voucher,
        status: VoucherStatus.SPLIT
      });
      
      //save first transaction split
      const transactionToSave1 = this.transactionRepository.create({
        senderAmount: firstVoucher.amount,
        senderCurrency: 'CDF',
        amount: firstVoucher.amount,
        currency: 'CDF',
        conversionRate: 0,
        senderId: transaction.senderId,
        ownerId: transaction.ownerId,
        stripePaymentId: transaction.id,
        voucher: firstVoucherJSON,
        status: TransactionStatus.PENDING,
        ownerType: ReceiverType.PROVIDER,
        hospitalId: providerId,
      });
      // console.log('saved', transactionToSave1 );
      const firstSavedTransaction = await this.transactionRepository.save(
        transactionToSave1,
      );
      const voucherToSave1 = this.voucherRepository.create({
        vid: firstVoucherJSON.id,
        voucherHash: firstTransactionHash,
        shortenHash: firstShortenHash,
        value: firstVoucherJSON.amount,
        senderId: transaction.senderId,
        senderType: SenderType.PAYER,
        receiverId: transaction.ownerId,
        receiverType: ReceiverType.PATIENT,
        status: VoucherStatus.UNCLAIMED,
        transaction: transactionToSave1,
      });
      await this.voucherRepository.save( voucherToSave1 );

      //save second transaction split
      const transactionToSave2 = this.transactionRepository.create({
        senderAmount: secondVoucher.amount,
        senderCurrency: 'CDF',
        amount: secondVoucher.amount,
        currency: 'CDF',
        conversionRate: 0,
        senderId: transaction.senderId,
        ownerId: transaction.ownerId,
        stripePaymentId: transaction.id,
        voucher: secondVoucherJSON,
        status: TransactionStatus.PENDING,
      });
      const secondSavedTransaction = await this.transactionRepository.save(
        transactionToSave2,
      );
      const voucherToSave2 = this.voucherRepository.create({
        vid: firstVoucherJSON.id,
        voucherHash: secondTransactionHash,
        shortenHash: secondShortenHash,
        value: secondVoucherJSON.amount,
        senderId: transaction.senderId,
        senderType: SenderType.PAYER,
        receiverId: transaction.ownerId,
        receiverType: ReceiverType.PATIENT,
        status: VoucherStatus.UNCLAIMED,
        transaction: transactionToSave2,
      });
      await this.voucherRepository.save( voucherToSave2 );

      return {
        code: 200,
        message: 'Voucher transfer authorized successfully',
      };
      
    } else {
      // transfer voucher from patient to provider
      //Update the voucher on block-chain

      // Update the transaction in the database
      const updatedTransaction = await this.transactionRepository.save({
        ...transaction,
        ownerType: ReceiverType.PROVIDER,
        hospitalId: providerId,
      });
      // console.log('updated', updatedTransaction, updatedVoucher );

      return {
        code: 200,
        message: 'Voucher transfer authorized successfully',
      };
    }
    // console.log( transaction, provider, providerId, voucher );
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
      .leftJoinAndMapOne(
        'transaction.voucherEntity',
        Voucher,
        'voucherEntity',
        'voucherEntity.transaction = transaction.id',
      )
      .leftJoinAndMapOne(
        'transaction.owner',
        Patient,
        'owner',
        'owner.id = transaction.ownerId',
      )
      .select([
        'transaction',
        'voucherEntity',
        'owner.firstName',
        'owner.lastName',
      ])
      // .where('transaction.ownerId = :providerId', { providerId })
      .where('transaction.hospitalId = :providerId', { providerId })
      .orderBy('transaction.updatedAt', 'DESC')
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
      .where('transaction.hospitalId = :providerId', { providerId })
      .getMany();

    let totalRedeemedAmount = 0,
      totalPendingAmount = 0,
      totalUnclaimedAmount = 0;

    transactions.forEach((transaction) => {
      if (transaction.status === TransactionStatus.PENDING)
        totalUnclaimedAmount += transaction.amount;
      if (transaction.status === TransactionStatus.PAID_OUT)
        totalRedeemedAmount += transaction.amount;
      if (transaction.status === TransactionStatus.SUCCESSFUL)
        totalPendingAmount += transaction.amount;
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
  async redeemVoucher(ids: string[]): Promise<Record<string, any>[]> {
    const transactions = await this.transactionRepository
      .createQueryBuilder('transaction')
      .where(`id In (:...ids)`, { ids })
      .andWhere(`transaction.status = :status`, {
        status: TransactionStatus.PENDING,
      })
      .getMany();

    // update transactions status to pending!.
    const updatedTransactionList = transactions.map((transaction) => ({
      ...transaction,
      status: TransactionStatus.SUCCESSFUL,
      voucher: {
        ...transaction.voucher,
        status: VoucherStatus.CLAIMED,
      },
    }));

    const updatedTransactions = await this.transactionRepository.save(
      updatedTransactionList,
    );

    //update voucher status to claimed
    const vouchers = await this.voucherRepository
      .createQueryBuilder('voucher')
      .where(`voucher.transaction_id In (:...ids)`, {
        ids: transactions.map((e) => e.id),
      })
      .andWhere(`voucher.status = :status`, {
        status: VoucherStatus.UNCLAIMED,
      })
      .getMany();

    const updatedVoucherList = vouchers.map((voucher) => ({
      ...voucher,
      status: VoucherStatus.PENDING,
    }));
    await this.voucherRepository.save(updatedVoucherList);

    //TODO: update the voucher details on chain.
    return updatedTransactions;
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
    return service;
  }

  // Get services of provider
  async getServicesByProviderId(providerId: string): Promise<Service[]> {
    const services = await this.servicesRepository.find({
      where: { provider: { id: providerId } },
      relations: ['provider'],
      select: ['id', 'createdAt', 'description', 'price', 'name'],
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
    return newPackage;
  }

  // Get services of provider
  async getPackagesByProviderId(providerId: string): Promise<Package[]> {
    const packages = await this.packageRepository.find({
      where: { provider: { id: providerId } },
      relations: ['provider', 'services'],
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
    let providers = await this.providerRepository
      .createQueryBuilder('providers')
      .leftJoinAndSelect('providers.packages', 'packages')
      .orderBy('providers.createdAt', 'DESC')
      .take(5)
      .getMany();

    return providers;
  }
}
