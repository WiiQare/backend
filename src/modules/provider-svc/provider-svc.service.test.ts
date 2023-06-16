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
} from '../../common/constants/enums';
import { ForbiddenException } from '@nestjs/common';
import { _403, _404 } from '../../common/constants/errors';
import { APP_NAME, DAY } from '../../common/constants/constants';
import { RegisterProviderDto } from './dto/provider.dto';

describe('ProviderService', () => {
  let service: ProviderService;
  let providerRepository: Repository<Provider>;
  let transactionRepository: Repository<Transaction>;
  let patientRepository: Repository<Patient>;
  let userRepository: Repository<User>;
  let packageRepository: Repository<Package>;
  let serviceRepository: Repository<Service>;

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
  const mockSmsService = {};

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
    ownerType: UserType.PATIENT,
    status: VoucherStatus.UNCLAIMED,
    transactionHash: 'transactionHash',
    shortenHash: 'shortenHash',
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
    } as unknown as Repository<Service>;

    service = new ProviderService(
      providerRepository,
      transactionRepository,
      patientRepository,
      userRepository,
      packageRepository,
      serviceRepository,
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

    it('should add a package to a provider', async () => {
      await service.addPackageToProvider(payload);
      expect(providerRepository.findOne).toHaveBeenCalledWith({
        where: { id: payload.providerId },
      });
      expect(packageRepository.save).toHaveBeenCalled();
    });

    it('should throw an error if the provider does not exist', async () => {
      providerRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.addPackageToProvider(payload)).rejects.toThrow(
        new ForbiddenException(_404.PROVIDER_NOT_FOUND),
      );
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
});
