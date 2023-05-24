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

describe('ProviderService', () => {
  let service: ProviderService;
  let providerRepository: Repository<Provider>;
  let transactionRepository: Repository<Transaction>;
  let patientRepository: Repository<Patient>;
  let userRepository: Repository<User>;
  let packageRepository: Repository<Package>;
  let serviceRepository: Repository<Service>;

  // Mock services
  const mockObjectStorageService = {};
  const mockCachingService = {};
  const mockMailService = {};
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

  it('should return the mock provder', async () => {
    const result = await service.findProviderByUserId('id');

    expect(result).toEqual(mockProvider);
    expect(result).toBeInstanceOf(Provider);
  });

  it('should add a service to a provider', async () => {
    const payload = {
      providerId: 'id',
      name: 'name',
      description: 'description',
      price: 1,
    };

    await service.addServiceToProvider(payload);
    expect(providerRepository.findOne).toHaveBeenCalledWith({
      where: { id: payload.providerId },
    });
    expect(serviceRepository.save).toHaveBeenCalled();
  });

  it('should add a package to a provider', async () => {
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

    await service.addPackageToProvider(payload);
    expect(providerRepository.findOne).toHaveBeenCalledWith({
      where: { id: payload.providerId },
    });
    expect(serviceRepository.save).toHaveBeenCalledTimes(
      payload.services.length,
    );
    expect(packageRepository.save).toHaveBeenCalled();
  });

  it('should add a service to a package', async () => {
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
});
