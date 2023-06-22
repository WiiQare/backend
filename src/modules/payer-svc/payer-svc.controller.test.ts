import { Repository } from 'typeorm';
import { PayerSvcController } from './payer-svc.controller';
import { User } from '../session/entities/user.entity';
import { PayerService } from './payer.service';
import { CachingService } from '../caching/caching.service';
import { SessionService } from '../session/session.service';
import { PatientSvcService } from '../patient-svc/patient-svc.service';
import { PatientResponseDto } from '../patient-svc/dto/patient.dto';

describe('PayerSvcController', () => {
  let mockUserRepository: Partial<Repository<User>>;
  let mockPayerService: Partial<PayerService>;
  let mockCachingService: Partial<CachingService>;
  let mockSessionService: Partial<SessionService>;
  let mockPatientService: Partial<PatientSvcService>;

  beforeEach(async () => {
    jest.clearAllMocks;

    // Mock dependencies
    mockUserRepository = {};

    mockPayerService = {};

    mockCachingService = {};

    mockSessionService = {};

    mockPatientService = {};

    // Create controller
    const payerSvcController = new PayerSvcController(
      mockUserRepository as Repository<User>,
      mockPayerService as PayerService,
      mockCachingService as CachingService,
      mockSessionService as SessionService,
      mockPatientService as PatientSvcService,
    );
  });

  describe('retrievePatientByPhoneNumber', () => {});

  describe('retrievePayerAccountInfo', () => {});

  describe('createPayerAccount', () => {});

  describe('registerNewPatient', () => {});

  describe('sendInviteToFriend', () => {});
});
