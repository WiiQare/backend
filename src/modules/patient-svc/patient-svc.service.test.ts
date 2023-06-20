import { Repository } from 'typeorm';
import { PatientSvcService } from './patient-svc.service';
import { Patient } from './entities/patient.entity';
import { User } from '../session/entities/user.entity';
import { Transaction } from '../smart-contract/entities/transaction.entity';
import { CreatePatientDto, PatientResponseDto } from './dto/patient.dto';
import {
  UserRole,
  UserStatus,
  UserType,
  VoucherStatus,
} from '../../common/constants/enums';

describe('PatientSvcService', () => {
  // Mock entities
  const mockUser: User = {
    id: 'id',
    createdAt: new Date(),
    updatedAt: new Date(),
    email: 'email',
    phoneNumber: '123456789',
    username: 'username',
    role: UserRole.PATIENT,
    status: UserStatus.INACTIVE,
    password: 'password',
  };

  const mockPatient: Patient = {
    id: 'id',
    createdAt: new Date(),
    updatedAt: new Date(),
    phoneNumber: '123456789',
    firstName: 'John',
    lastName: 'Doe',
    user: mockUser,
    email: 'email',
    homeAddress: 'homeAddress',
    country: 'country',
    city: 'city',
  };

  const mockTransaction: Transaction = {
    id: 'id',
    createdAt: new Date('2023-06-20T10:00:00Z'),
    updatedAt: new Date('2023-06-20T10:01:00Z'),
    senderId: '216fefae-c968-4f2a-b5a3-40eb621e2e71',
    ownerId: '7a11095d-ec42-4f9a-9fb1-3261b047c524',
    senderAmount: 1,
    senderCurrency: 'USD',
    amount: 1,
    conversionRate: 1,
    currency: 'FC',
    ownerType: UserType.PATIENT,
    status: VoucherStatus.UNCLAIMED,
    transactionHash: 'transactionHash1',
    shortenHash: 'shortenHash1',
    stripePaymentId: 'stripePaymentId1',
    voucher: { voucher: 'voucher1' },
  };

  // Mock repositories
  const patientRepository = {
    findOne: jest.fn().mockResolvedValue(mockPatient),
    create: jest.fn().mockReturnValue(mockPatient),
    save: jest.fn().mockResolvedValue(mockPatient),
  } as unknown as Repository<Patient>;

  const transactionRepository = {
    createQueryBuilder: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([mockTransaction]),
    }),
  } as unknown as Repository<Transaction>;

  // Mock patient service
  let patientSvcService: PatientSvcService;

  beforeEach(() => {
    jest.clearAllMocks();

    patientSvcService = new PatientSvcService(
      patientRepository,
      transactionRepository,
    );
  });
});
