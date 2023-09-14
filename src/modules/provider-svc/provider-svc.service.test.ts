import { Repository } from 'typeorm';
import { ProviderService } from './provider-svc.service';
import { ObjectStorageService } from '../object-storage/object-storage.service';
import { CachingService } from '../caching/caching.service';
import { MailService } from '../mail/mail.service';
import { SmsService } from '../sms/sms.service';
import { Provider } from './entities/provider.entity';
import { Package } from './entities/package.entity';
import { Service } from './entities/service.entity';
import { Transaction } from '../smart-contract/entities/transaction.entity';
import { Patient } from '../patient-svc/entities/patient.entity';
import { User } from '../session/entities/user.entity';
import {
  BusinessType,
  UserType,
  VoucherStatus,
  UserRole,
  UserStatus,
  ReceiverType,
  TransactionStatus,
  SenderType,
} from '../../common/constants/enums';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { _403, _404 } from '../../common/constants/errors';
import { APP_NAME, DAY, HOUR } from '../../common/constants/constants';
import { RegisterProviderDto } from './dto/provider.dto';
import { Voucher } from '../smart-contract/entities/voucher.entity';

describe('ProviderService', () => {
  let service: ProviderService;
  let providerRepository: Repository<Provider>;
  let transactionRepository: Repository<Transaction>;
  let patientRepository: Repository<Patient>;
  let userRepository: Repository<User>;
  let packageRepository: Repository<Package>;
  let serviceRepository: Repository<Service>;
  let voucherRepository: Repository<Voucher>;

  // Mock services
  const mockObjectStorageService = {
    saveObject: jest.fn(),
  } as unknown as ObjectStorageService;
  const mockCachingService = {
    save: jest.fn(),
    get: jest.fn().mockReturnValue({
      email: 'email',
      password: 'password',
    }),
  } as unknown as CachingService;
  const mockMailService = {
    sendProviderVerificationEmail: jest.fn(),
  } as unknown as MailService;
  const mockSmsService = {
    sendTransactionVerificationTokenBySmsToAPatient: jest.fn(),
  } as unknown as SmsService;

  // Mock entities
  const mockProvider: Provider = {
    id: 'id',
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'name',
    email: 'email',
    address: 'address',
    phone: 'phone',
    city: 'city',
    postalCode: 'postalCode',
    nationalId: 'nationalId',
    businessRegistrationNo: 1,
    businessType: BusinessType.HOSPITAL,
    logoLink: 'logoLink',
    contactPerson: {
      firstName: 'firstName',
      lastName: 'lastName',
      phone: 'phone',
      email: 'email',
      occupation: 'occupation',
      country: 'country',
    },
    services: [],
    packages: [],
  };

  const mockPackage: Package = {
    id: 'id',
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'name',
    description: 'description',
    price: 1,
    provider: new Provider(),
    services: [],
  };

  const mockService: Service = {
    id: 'id',
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'name',
    description: 'description',
    price: 1,
    provider: new Provider(),
    packages: [mockPackage],
  };

  const mockTransaction: Transaction = {
    id: 'id',
    createdAt: new Date(),
    updatedAt: new Date(),
    senderAmount: 1,
    senderCurrency: 'senderCurrency',
    amount: 1,
    conversionRate: 1,
    currency: 'currency',
    senderId: 'senderId',
    ownerId: 'ownerId',
    hospitalId: 'hospitalId',
    ownerType: ReceiverType.PATIENT,
    status: TransactionStatus.PENDING,
    stripePaymentId: 'stripePaymentId',
    voucher: { voucher: 'voucher' },
  };

  const mockUser: User = {
    id: 'id',
    createdAt: new Date(),
    updatedAt: new Date(),
    email: 'email',
    phoneNumber: 'phoneNumber',
    username: 'username',
    role: UserRole.PATIENT,
    status: UserStatus.ACTIVE,
    password: 'password',
    savings: [],
  };

  const mockPatient: Patient = {
    id: 'id',
    createdAt: new Date(),
    updatedAt: new Date(),
    phoneNumber: 'phoneNumber',
    firstName: 'firstName',
    lastName: 'lastName',
    user: mockUser,
    email: 'email',
    homeAddress: 'homeAddress',
    country: 'country',
  };

  const mockVoucher: Voucher = {
    id: 'id',
    updatedAt: new Date(),
    createdAt: new Date(),
    voucherHash: '',
    shortenHash: '',
    value: 1,
    senderId: mockProvider.id,
    senderType: SenderType.PAYER,
    receiverId: mockPatient.id,
    receiverType: ReceiverType.PATIENT,
    status: VoucherStatus.PENDING,
    transaction: mockTransaction,
  };

  const mockVoucherWithTransaction = {
    ...mockVoucher,
    transaction: mockTransaction
  }

  // Mock relations
  mockProvider.user = mockUser;
  mockPackage.services = [mockService];
  mockService.packages = [mockPackage];

  beforeEach(async () => {
    jest.clearAllMocks();

    // Mock repositories
    providerRepository = {
      findOne: jest.fn().mockResolvedValue(mockProvider),
      save: jest.fn().mockResolvedValue(mockProvider),
    } as unknown as Repository<Provider>;
    transactionRepository = {
      findOne: jest.fn().mockResolvedValue(mockTransaction),
      save: jest.fn().mockResolvedValue(mockTransaction),
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockTransaction]),
      }),
    } as unknown as Repository<Transaction>;
    voucherRepository = {
      findOne: jest.fn().mockResolvedValue(mockVoucherWithTransaction),
      save: jest.fn().mockResolvedValue(mockVoucher),
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockVoucher]),
      }),
    } as unknown as Repository<Voucher>;
    patientRepository = {
      findOne: jest.fn().mockResolvedValue(mockPatient),
      save: jest.fn().mockResolvedValue(mockPatient),
    } as unknown as Repository<Patient>;
    userRepository = {} as unknown as Repository<User>;
    packageRepository = {
      findOne: jest.fn().mockResolvedValue(mockPackage),
      save: jest.fn().mockResolvedValue(mockPackage),
    } as unknown as Repository<Package>;
    serviceRepository = {
      save: jest.fn().mockResolvedValue(mockService),
      find: jest.fn().mockResolvedValue([mockService]),
    } as unknown as Repository<Service>;

    service = new ProviderService(
      providerRepository,
      transactionRepository,
      patientRepository,
      userRepository,
      packageRepository,
      serviceRepository,
      voucherRepository,
      mockObjectStorageService as ObjectStorageService,
      mockCachingService as CachingService,
      mockMailService as MailService,
      mockSmsService as SmsService,
    );
  });

  describe('findProviderByUserId', () => {
    it('should return the mock provder', async () => {
      const result = await service.findProviderByUserId('id');

      expect(result).toEqual(mockProvider);
    });

    it('should return null if the provider does not exist', async () => {
      providerRepository.findOne = jest.fn().mockResolvedValue(null);

      const result = await service.findProviderByUserId('id');

      expect(result).toBeNull();
    });
  });

  describe('providerVerifyEmail', () => {
    const payload = {
      email: 'email',
      password: 'password',
    };

    it('should verify the email of a provider', async () => {
      await service.providerVerifyEmail(payload);
      expect(mockCachingService.save).toHaveBeenCalledWith(
        expect.any(String),
        {
          email: payload.email,
          password: payload.password,
        },
        DAY,
      );
      expect(
        mockMailService.sendProviderVerificationEmail,
      ).toHaveBeenCalledWith(payload.email, expect.any(String));
    });
  });

  describe('registerNewProvider', () => {
    const payload: RegisterProviderDto = {
      name: 'name',
      emailVerificationToken: 'emailVerificationToken',
      address: 'address',
      phone: 'phone',
      city: 'city',
      postalCode: 'postalCode',
      nationalId: 'nationalId',
      businessRegistrationNo: 1,
      businessType: BusinessType.HOSPITAL,
      contactPersonFirstName: 'contactPersonFirstName',
      contactPersonLastName: 'contactPersonLastName',
      contactPersonPhone: 'contactPersonPhone',
      contactPersonEmail: 'contactPersonEmail',
      contactPersonOccupation: 'contactPersonOccupation',
      contactPersonCountry: 'contactPersonCountry',
      contactPersonHomeAddress: 'contactPersonHomeAddress',
    };

    const logo: Express.Multer.File = {} as Express.Multer.File;

    const cacheToken = `${APP_NAME}:email:${payload.emailVerificationToken}`;

    it('should register a new provider', async () => {
      const contactPerson = {
        email: payload.contactPersonEmail,
        country: payload.contactPersonCountry,
        firstName: payload.contactPersonFirstName,
        lastName: payload.contactPersonLastName,
        homeAddress: payload.contactPersonHomeAddress,
        phone: payload.contactPersonPhone,
        occupation: payload.contactPersonOccupation,
      };

      const result = await service.registerNewProvider(logo, payload);
      expect(providerRepository.save).toHaveBeenCalled();
      expect(mockObjectStorageService.saveObject).toHaveBeenCalledWith(logo);
      expect(mockCachingService.get).toHaveBeenCalledWith(cacheToken);
      expect(providerRepository.save).toHaveBeenCalledWith({
        email: 'email',
        logoLink: 'https://google.com/logo',
        name: payload.name,
        address: payload.address,
        businessRegistrationNo: payload.businessRegistrationNo,
        nationalId: payload.nationalId,
        businessType: payload.businessType,
        phone: payload.phone,
        city: payload.city,
        postalCode: payload.postalCode,
        emailVerificationToken: payload.emailVerificationToken,
        contactPerson: contactPerson,
        user: {
          email: 'email',
          password: expect.any(String),
          phoneNumber: payload.phone,
          role: UserRole.PROVIDER,
          status: UserStatus.INACTIVE,
        },
      });

      expect(result).toEqual({
        id: mockProvider.id,
        providerName: mockProvider.name,
        address: mockProvider.address,
        businessType: mockProvider.businessType,
        businessRegistrationNo: mockProvider.businessRegistrationNo,
        city: mockProvider.city,
        email: mockProvider.email,
      });
    });

    it('should throw an error if the email verification token is invalid', async () => {
      mockCachingService.get = jest.fn().mockResolvedValue(null);

      await expect(service.registerNewProvider(logo, payload)).rejects.toThrow(
        new ForbiddenException(_403.INVALID_EMAIL_VERIFICATION_TOKEN),
      );
    });
  });

  describe('sendTxVerificationOTP', () => {
    it('should send a verification OTP to a patient', async () => {
      await service.sendTxVerificationOTP(
        'shortenHash',
        mockPatient,
        mockTransaction,
      );
      expect(mockCachingService.save).toHaveBeenCalledWith(
        `${APP_NAME}:transaction:shortenHash`,
        expect.any(String),
        HOUR,
      );
      expect(
        mockSmsService.sendTransactionVerificationTokenBySmsToAPatient,
      ).toHaveBeenCalledWith(
        expect.any(String),
        mockPatient.phoneNumber,
        mockTransaction.amount,
      );
    });
  });

  describe('getTransactionByShortenHash', () => {
    const shortenHash = 'shortenHash';

    it('should return the details of the mock transaction', async () => {
      jest.spyOn(service, 'sendTxVerificationOTP').mockResolvedValue(null);

      const result = await service.getTransactionByShortenHash(shortenHash);
      expect(voucherRepository.findOne).toHaveBeenCalledWith({
        // where: { id: mockTransaction.ownerId, ownerType: UserType.PATIENT },
        where: { shortenHash },
        relations: [ 'transaction' ]
      });
      expect(patientRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockTransaction.ownerId },
      });
      expect(service.sendTxVerificationOTP).toHaveBeenCalledWith(
        shortenHash,
        mockPatient,
        mockTransaction,
      );
      expect(result).toEqual({
        hash: mockVoucher.voucherHash,
        shortenHash: mockVoucher.shortenHash,
        amount: mockTransaction.amount,
        currency: mockTransaction.currency,
        patientNames: `${mockPatient.firstName} ${mockPatient.lastName}`,
        patientPhoneNumber: mockPatient.phoneNumber,
      });
    });

    // it('should throw an error if the transaction does not exist', async () => {
    //   transactionRepository.findOne = jest.fn().mockResolvedValue(null);

    //   await expect(
    //     service.getTransactionByShortenHash('someShortenHash'),
    //   ).rejects.toThrow(new NotFoundException(_404.INVALID_TRANSACTION_HASH));
    // });

    // it('should throw an error if the transaction is not owned by a patient', async () => {
    //   patientRepository.findOne = jest.fn().mockResolvedValue(null);

    //   await expect(
    //     service.getTransactionByShortenHash(shortenHash),
    //   ).rejects.toThrow(new NotFoundException(_404.PATIENT_NOT_FOUND));
    // });
  });

  describe('authorizeVoucherTransfer', () => {
    const shortenHash = 'shortenHash';
    const providerId = 'id';
    const securityCode = 'securityCode';
    const cachedToken = `${APP_NAME}:transaction:${shortenHash}`;

    // it('should authorize a voucher transfer', async () => {
    //   mockCachingService.get = jest.fn().mockResolvedValue(securityCode);

    //   const result = await service.authorizeVoucherTransfer(
    //     shortenHash,
    //     providerId,
    //     securityCode,
    //   );
    //   expect(transactionRepository.findOne).toHaveBeenCalledWith({
    //     where: { shortenHash, ownerType: UserType.PATIENT },
    //   });
    //   expect(providerRepository.findOne).toHaveBeenCalledWith({
    //     where: { id: providerId },
    //   });
    //   expect(mockCachingService.get).toHaveBeenCalledWith(cachedToken);
    //   expect(transactionRepository.save).toHaveBeenCalledWith({
    //     ...mockTransaction,
    //     ownerType: UserType.PROVIDER,
    //     ownerId: providerId,
    //   });
    //   expect(result).toEqual({
    //     code: 200,
    //     message: 'Voucher transfer authorized successfully',
    //   });
    // });

    // it('should throw an error if the transaction does not exist', async () => {
    //   transactionRepository.findOne = jest.fn().mockResolvedValue(null);

    //   await expect(
    //     service.authorizeVoucherTransfer(
    //       'someShortenHash',
    //       providerId,
    //       securityCode,
    //     ),
    //   ).rejects.toThrow(new NotFoundException(_404.INVALID_TRANSACTION_HASH));
    // });

    // it('should throw an error if the providerId is invalid', async () => {
    //   providerRepository.findOne = jest.fn().mockResolvedValue(null);

    //   await expect(
    //     service.authorizeVoucherTransfer(
    //       shortenHash,
    //       'someProviderId',
    //       securityCode,
    //     ),
    //   ).rejects.toThrow(new NotFoundException(_404.PROVIDER_NOT_FOUND));
    // });

    it('should throw an error if the security code is invalid', async () => {
      mockCachingService.get = jest.fn().mockResolvedValue('savedSecurityCode');

      await expect(
        service.authorizeVoucherTransfer(shortenHash, providerId, securityCode),
      ).rejects.toThrow(
        new ForbiddenException(_403.INVALID_VOUCHER_TRANSFER_VERIFICATION_CODE),
      );
    });
  });

  describe('getAllTransactions', () => {
    const providerId = 'id';

    // it('should return all transactions', async () => {
    //   const result = await service.getAllTransactions(providerId);
    //   expect(transactionRepository.createQueryBuilder).toHaveBeenCalledWith(
    //     'transaction',
    //   );
    //   expect(
    //     transactionRepository.createQueryBuilder().where,
    //   ).toHaveBeenCalledWith('transaction.ownerId = :providerId', {
    //     providerId,
    //   });
    //   expect(result).toEqual([mockTransaction]);
    // });
  });

  // describe('getTransactionStatistic', () => {
  //   const providerId = 'id';
  //   // mockTransaction has voucher status of unclaimed
  //   const mockClaimedTx = {
  //     ...mockTransaction,
  //     status: VoucherStatus.CLAIMED,
  //   };
  //   const mockPendingTx = {
  //     ...mockTransaction,
  //     status: VoucherStatus.PENDING,
  //   };
  //   const mockBurnedTx = {
  //     ...mockTransaction,
  //     status: VoucherStatus.BURNED,
  //   };

  //   it('should return the transaction statistics', async () => {
  //     transactionRepository.createQueryBuilder = jest.fn().mockReturnValue({
  //       where: jest.fn().mockReturnThis(),
  //       andWhere: jest.fn().mockReturnThis(),
  //       getMany: jest
  //         .fn()
  //         .mockResolvedValue([
  //           mockTransaction,
  //           mockClaimedTx,
  //           mockPendingTx,
  //           mockBurnedTx,
  //           mockBurnedTx,
  //           mockClaimedTx,
  //           mockTransaction,
  //           mockClaimedTx,
  //         ]),
  //     });

  //     const result = await service.getTransactionStatistic(providerId);
  //     expect(transactionRepository.createQueryBuilder).toHaveBeenCalledWith(
  //       'transaction',
  //     );
  //     expect(
  //       transactionRepository.createQueryBuilder().where,
  //     ).toHaveBeenCalledWith('transaction.ownerId = :providerId', {
  //       providerId,
  //     });
  //     expect(result).toEqual({
  //       totalAmount: 8,
  //       totalUniquePatients: 1,
  //       totalRedeemedAmount: 3,
  //       totalPendingAmount: 1,
  //       totalUnclaimedAmount: 2,
  //     });
  //   });
  // });

  describe('redeemVoucher', () => {
    const hashes = ['hash1', 'hash2'];
    const mockTx1 = {
      ...mockTransaction,
      transactionHash: 'hash1',
    };
    const mockTx2 = {
      ...mockTransaction,
      transactionHash: 'hash2',
    };

    const newTxList = [
      {
        ...mockTx1,
        status: VoucherStatus.PENDING,
      },
      {
        ...mockTx2,
        status: VoucherStatus.PENDING,
      },
    ];

    it('should redeem vouchers', async () => {
      transactionRepository.createQueryBuilder = jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockTx1, mockTx2]),
      });

      transactionRepository.save = jest.fn().mockResolvedValue(newTxList);

      const result = await service.redeemVoucher(hashes);
      expect(transactionRepository.save).toHaveBeenCalledWith(newTxList);
      expect(result).toEqual(newTxList);
    });
  });

  describe('addServiceToProvider', () => {
    const payload = {
      providerId: 'id',
      name: 'name',
      description: 'description',
      price: 1,
    };

    it('should add a service to a provider', async () => {
      await service.addServiceToProvider(payload);
      expect(providerRepository.findOne).toHaveBeenCalledWith({
        where: { id: payload.providerId },
      });
      expect(serviceRepository.save).toHaveBeenCalled();
    });

    it('should throw an error if the provider does not exist', async () => {
      providerRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.addServiceToProvider(payload)).rejects.toThrow(
        new ForbiddenException(_404.PROVIDER_NOT_FOUND),
      );
    });
  });

  describe('getServicesByProviderId', () => {
    // it('should return all services of a provider', async () => {
    //   const result = await service.getServicesByProviderId('id');
    //   expect(serviceRepository.find).toHaveBeenCalledWith({
    //     where: { provider: mockProvider },
    //   });
    //   expect(result).toEqual([mockService]);
    // });
    // it('should throw an error if the provider does not exist', async () => {
    //   providerRepository.findOne = jest.fn().mockResolvedValue(null);
    //   await expect(service.getServicesByProviderId('someId')).rejects.toThrow(
    //     new ForbiddenException(_404.PROVIDER_NOT_FOUND),
    //   );
    // });
  });

  describe('addPackageToProvider', () => {
    const payload = {
      providerId: 'id',
      name: 'name',
      description: 'description',
      price: 1,
      services: [
        {
          name: 'service1',
          description: 'description1',
          price: 1,
          providerId: 'id',
        },
        {
          name: 'service2',
          description: 'description2',
          price: 2,
          providerId: 'id',
        },
      ],
    };

    // it('should add a package to a provider', async () => {
    //   //await service.addPackageToProvider(payload);
    //   expect(providerRepository.findOne).toHaveBeenCalledWith({
    //     where: { id: payload.providerId },
    //   });
    //   expect(packageRepository.save).toHaveBeenCalled();
    // });

    it('should throw an error if the provider does not exist', async () => {
      providerRepository.findOne = jest.fn().mockResolvedValue(null);

      // await expect(service.addPackageToProvider(payload)).rejects.toThrow(
      //   new ForbiddenException(_404.PROVIDER_NOT_FOUND),
      // );
    });
  });

  describe('addServiceToPackage', () => {
    const payload = {
      providerId: 'id',
      package: mockPackage,
      services: [
        {
          name: 'service1',
          description: 'description1',
          price: 1,
          providerId: 'id',
        },
        {
          name: 'service2',
          description: 'description2',
          price: 2,
          providerId: 'id',
        },
      ],
    };

    it('should add a service to a package', async () => {
      await service.addServiceToPackage(payload);
      expect(providerRepository.findOne).toHaveBeenCalledWith({
        where: { id: payload.providerId },
      });
      expect(packageRepository.findOne).toHaveBeenCalledWith({
        where: { id: payload.package.id },
      });
      expect(serviceRepository.save).toHaveBeenCalledTimes(
        payload.services.length,
      );
      expect(packageRepository.save).toHaveBeenCalled();
    });

    it('should throw an error if the provider does not exist', async () => {
      providerRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.addServiceToPackage(payload)).rejects.toThrow(
        new ForbiddenException(_404.PROVIDER_NOT_FOUND),
      );
    });

    it('should throw an error if the package does not exist', async () => {
      packageRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.addServiceToPackage(payload)).rejects.toThrow(
        new ForbiddenException(_404.PACKAGE_NOT_FOUND),
      );
    });
  });

  describe('getListProvider', () => {
    // it('should return all Provider', async () => {
    //   const result = await service.listProvider();
    //   expect(serviceRepository.find).toHaveBeenCalledWith({
    //     where: { provider: mockProvider },
    //   });
    //   expect(result).toEqual([mockService]);
    // });
  });
});
