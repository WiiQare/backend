import { Repository } from 'typeorm';
import { PayerService } from './payer.service';
import { MailService } from '../mail/mail.service';
import { SmsService } from '../sms/sms.service';
import { Payer } from './entities/payer.entity';
import { User } from '../session/entities/user.entity';
import { Transaction } from '../smart-contract/entities/transaction.entity';
import { Patient } from '../patient-svc/entities/patient.entity';
import {
  UserRole,
  UserStatus,
  UserType,
  VoucherStatus,
} from '../../common/constants/enums';

describe('PayerService', () => {
  let service: PayerService;
  let payerRepository: Repository<Payer>;
  let transactionRepository: Repository<Transaction>;
  let patientRepository: Repository<Patient>;
  let userRepository: Repository<User>;

  // Mock services
  const mockMailService = {};
  const mockSmsService = {};

  // Mock entities
  const mockUser: User = {
    id: 'id',
    createdAt: new Date(),
    updatedAt: new Date(),
    email: 'email',
    phoneNumber: 'phoneNumber',
    username: 'username',
    role: UserRole.PAYER,
    status: UserStatus.ACTIVE,
    password: 'password',
  };

  const mockPayer: Payer = {
    id: 'id',
    createdAt: new Date(),
    updatedAt: new Date(),
    firstName: 'firstName',
    lastName: 'lastName',
    user: mockUser,
    country: 'country',
    referralCode: 'REF-f01a2f',
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

  const mockTransaction: Transaction = {
    id: 'id',
    createdAt: new Date(),
    updatedAt: new Date(),
    senderAmount: 1,
    senderCurrency: 'USD',
    amount: 1,
    conversionRate: 1,
    currency: 'USD',
    senderId: mockPayer.id,
    ownerId: mockPayer.id,
    ownerType: UserType.PAYER,
    status: VoucherStatus.UNCLAIMED,
    transactionHash: 'transactionHash',
    shortenHash: 'shortenHash',
    stripePaymentId: 'stripePaymentId',
    voucher: { voucher: 'voucher' },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    // Mock repositories
    patientRepository = {
      findOne: jest.fn().mockResolvedValue(mockPatient),
    } as unknown as Repository<Patient>;

    payerRepository = {
      findOne: jest.fn().mockResolvedValue(mockPayer),
      create: jest.fn().mockReturnValue(mockPayer),
      save: jest.fn().mockResolvedValue(mockPayer),
      createQueryBuilder: jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockPayer),
      }),
    } as unknown as Repository<Payer>;

    userRepository = {
      findOne: jest.fn().mockResolvedValue(mockUser),
    } as unknown as Repository<User>;

    transactionRepository = {
      findOne: jest.fn().mockResolvedValue(mockTransaction),
    } as unknown as Repository<Transaction>;

    service = new PayerService(
      patientRepository,
      payerRepository,
      userRepository,
      transactionRepository,
      mockMailService as MailService,
      mockSmsService as SmsService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the mock payer by id', async () => {
    const result = await service.findPayerById(mockPayer.id);

    expect(result).toEqual(mockPayer);
    expect(payerRepository.findOne).toBeCalledTimes(1);
  });

  it('should return the mock payer by user id', async () => {
    const result = await service.findPayerByUserId(mockUser.id);

    expect(result).toEqual(mockPayer);
    expect(payerRepository.findOne).toBeCalledTimes(1);
  });

  it('should return a new payer equal to the mock payer', async () => {
    const result = await service.registerNewPayerAccount({
      phoneNumber: 'phoneNumber',
      email: 'email',
      emailVerificationToken: 'emailVerificationToken',
      firstName: 'firstName',
      lastName: 'lastName',
      password: 'password',
      country: 'country',
    });

    expect(result).toEqual(mockPayer);
    expect(payerRepository.create).toBeCalledTimes(1);
    expect(payerRepository.save).toBeCalledTimes(1);
    expect(payerRepository.save).toBeCalledWith(mockPayer);
  });
});
