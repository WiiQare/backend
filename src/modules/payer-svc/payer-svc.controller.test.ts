import { Repository } from 'typeorm';
import { PayerSvcController } from './payer-svc.controller';
import { User } from '../session/entities/user.entity';
import { Payer } from '../payer-svc/entities/payer.entity';
import { PayerService } from './payer.service';
import { CachingService } from '../caching/caching.service';
import { SessionService } from '../session/session.service';
import { PatientSvcService } from '../patient-svc/patient-svc.service';
import { SearchPatientDto } from './dto/payer.dto';
import { PatientResponseDto } from '../patient-svc/dto/patient.dto';
import { UserRole, UserStatus } from '../../common/constants/enums';
import { NotFoundException } from '@nestjs/common';
import { _404 } from '../../common/constants/errors';

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

  const mockUUID = '66a3b552-5b0b-428d-bd4e-d9f2d8182ba3';

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
    firstName: 'Jane',
    lastName: 'Doe',
    user: mockUser,
    country: 'country',
    homeAddress: 'homeAddress',
    province: 'province',
    city: 'city',
    referralCode: 'referralCode',
  };

  beforeEach(async () => {
    jest.clearAllMocks;

    // Mock dependencies
    mockUserRepository = {};

    mockPayerService = {
      findPayerById: jest.fn().mockResolvedValue(mockPayer),
    };

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
      payerId: mockUUID,
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

  describe('retrievePayerAccountInfo', () => {
    it('should retrieve the payer by id', async () => {
      // Call method
      const response = await payerSvcController.retrievePayerAccountInfo(
        mockUUID,
      );

      expect(mockPayerService.findPayerById).toHaveBeenCalledWith(mockUUID);
      expect(response).toEqual(mockPayer);
    });

    it('should throw an error if payer is not found', async () => {
      mockPayerService.findPayerById = jest.fn().mockResolvedValue(null);

      // Call method
      expect(async () =>
        payerSvcController.retrievePayerAccountInfo(mockUUID),
      ).rejects.toThrow(new NotFoundException(_404.PAYER_NOT_FOUND));
    });
  });

  describe('createPayerAccount', () => {});

  describe('registerNewPatient', () => {});

  describe('sendInviteToFriend', () => {});
});
