import { Repository } from 'typeorm';
import { PayerSvcController } from './payer-svc.controller';
import { User } from '../session/entities/user.entity';
import { PayerService } from './payer.service';
import { CachingService } from '../caching/caching.service';
import { SessionService } from '../session/session.service';
import { PatientSvcService } from '../patient-svc/patient-svc.service';
import { SearchPatientDto } from './dto/payer.dto';
import { PatientResponseDto } from '../patient-svc/dto/patient.dto';

describe('PayerSvcController', () => {
  let mockUserRepository: Partial<Repository<User>>;
  let mockPayerService: Partial<PayerService>;
  let mockCachingService: Partial<CachingService>;
  let mockSessionService: Partial<SessionService>;
  let mockPatientService: Partial<PatientSvcService>;
  let payerSvcController: PayerSvcController;

  const mockPatientResponseDto: PatientResponseDto = {
    id: 'id',
    phoneNumber: 'phoneNumber',
    firstName: 'John',
    lastName: 'Doe',
    email: 'email',
  };

  beforeEach(async () => {
    jest.clearAllMocks;

    // Mock dependencies
    mockUserRepository = {};

    mockPayerService = {};

    mockCachingService = {};

    mockSessionService = {};

    mockPatientService = {
      findPatientByPhoneNumber: jest
        .fn()
        .mockResolvedValue([mockPatientResponseDto]),
      findAllPatientByPayerId: jest.fn().mockResolvedValue([
        {
          ...mockPatientResponseDto,
          phoneNumber: '',
        },
      ]),
    };

    // Create controller
    payerSvcController = new PayerSvcController(
      mockUserRepository as Repository<User>,
      mockPayerService as PayerService,
      mockCachingService as CachingService,
      mockSessionService as SessionService,
      mockPatientService as PatientSvcService,
    );
  });

  describe('retrievePatientByPhoneNumber', () => {
    const mockSearchPatientDto: SearchPatientDto = {
      phoneNumber: 'phoneNumber',
      payerId: 'payerId',
    };

    it('should retrieve a patient by phone number', async () => {
      // Call method
      const response = await payerSvcController.retrievePatientByPhoneNumber(
        mockSearchPatientDto,
      );

      expect(mockPatientService.findPatientByPhoneNumber).toHaveBeenCalledWith(
        mockSearchPatientDto.phoneNumber,
      );
      expect(response).toEqual([mockPatientResponseDto]);
    });

    it('should retrieve a patient by payer id', async () => {
      // Adjust mock
      const mockNewSearchPatientDto: SearchPatientDto = {
        ...mockSearchPatientDto,
        phoneNumber: '',
      };

      // Call method
      const response = await payerSvcController.retrievePatientByPhoneNumber(
        mockNewSearchPatientDto,
      );

      expect(mockPatientService.findAllPatientByPayerId).toHaveBeenCalledWith(
        mockNewSearchPatientDto.payerId,
      );
      expect(response).toEqual([
        {
          ...mockPatientResponseDto,
          phoneNumber: '',
        },
      ]);
    });
  });

  describe('retrievePayerAccountInfo', () => {});

  describe('createPayerAccount', () => {});

  describe('registerNewPatient', () => {});

  describe('sendInviteToFriend', () => {});
});
