import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from '../../config/app-config.service';
import { PayerService } from '../payer-svc/payer.service';
import { ProviderService } from '../provider-svc/provider-svc.service';
import { MailService } from '../mail/mail.service';
import { CachingService } from '../caching/caching.service';
import { SessionService } from './session.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UserRole, UserStatus } from '../../common/constants/enums';
import {
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('SessionService', () => {
  // Mock user entity
  const mockUser = {
    id: 'id',
    email: 'email',
    phoneNumber: 'phoneNumber',
    username: 'username',
    role: UserRole.PATIENT,
    status: UserStatus.ACTIVE,
    password: 'password',
  };

  // Mock services
  const mockJwtService = {
    sign: jest.fn().mockReturnValue('jwtToken'),
  } as unknown as JwtService;

  const mockAppConfigService = {
    hashingSecret: 'hashingSecret',
  } as unknown as AppConfigService;

  const mockPayerService = {
    findPayerByUserId: jest.fn(),
  } as unknown as PayerService;

  const mockProviderService = {
    findProviderByUserId: jest.fn(),
  } as unknown as ProviderService;

  const mockMailService = {
    sendOTPEmail: jest.fn(),
    sendResetPasswordEmail: jest.fn(),
  } as unknown as MailService;

  const mockCachingService = {
    save: jest.fn(),
    get: jest.fn(),
  } as unknown as CachingService;

  let sessionService: SessionService;
  let mockUserRepository: Repository<User>;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Mock user repository
    mockUserRepository = {
      findOne: jest.fn().mockResolvedValue(mockUser),
      save: jest.fn().mockResolvedValue(undefined),
    } as unknown as Repository<User>;

    // Initialize session service

    sessionService = new SessionService(
      mockUserRepository,
      mockJwtService,
      mockAppConfigService,
      mockPayerService,
      mockProviderService,
      mockMailService,
      mockCachingService,
    );
  });

  it('should be defined', () => {
    expect(sessionService).toBeDefined();
  });

  describe('authenticateUser', () => {
    it('should throw an error when no phoneNumber, username, or email is provided', async () => {
      const payload: CreateSessionDto = {
        password: 'password',
      };

      await expect(sessionService.authenticateUser(payload)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw an error when user is not found', async () => {
      const payload: CreateSessionDto = {
        password: 'password',
        phoneNumber: 'phoneNumber',
      };

      mockUserRepository.findOne = jest.fn().mockResolvedValue(undefined);

      await expect(sessionService.authenticateUser(payload)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw an error when user is not active', async () => {
      const payload: CreateSessionDto = {
        password: 'password',
        phoneNumber: 'phoneNumber',
      };

      mockUserRepository.findOne = jest.fn().mockResolvedValue({
        ...mockUser,
        status: UserStatus.INACTIVE,
      });

      await expect(sessionService.authenticateUser(payload)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw an error when there is no phoneNumber, username, or email', async () => {
      const payload: CreateSessionDto = {
        password: 'password',
        phoneNumber: '',
        username: '',
        email: '',
      };

      await expect(sessionService.authenticateUser(payload)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw an error when payer details are not found', async () => {
      const payload: CreateSessionDto = {
        password: 'password',
        phoneNumber: 'phoneNumber',
      };

      mockUserRepository.findOne = jest.fn().mockResolvedValue({
        ...mockUser,
        role: UserRole.PAYER,
      });

      mockPayerService.findPayerByUserId = jest
        .fn()
        .mockResolvedValue(undefined);

      await expect(sessionService.authenticateUser(payload)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw an error when password is invalid for payer', async () => {
      const payload: CreateSessionDto = {
        password: 'wrongPassword',
        phoneNumber: 'phoneNumber',
      };

      mockUserRepository.findOne = jest.fn().mockResolvedValue({
        ...mockUser,
        role: UserRole.PAYER,
      });

      mockPayerService.findPayerByUserId = jest.fn().mockResolvedValue({
        id: 'payerId',
      });

      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);

      await expect(sessionService.authenticateUser(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw an error when provider details are not found', async () => {
      const payload: CreateSessionDto = {
        password: 'password',
        phoneNumber: 'phoneNumber',
      };

      mockUserRepository.findOne = jest.fn().mockResolvedValue({
        ...mockUser,
        role: UserRole.PROVIDER,
      });

      mockProviderService.findProviderByUserId = jest
        .fn()
        .mockResolvedValue(undefined);

      await expect(sessionService.authenticateUser(payload)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw an error when password is invalid for provider', async () => {
      const payload: CreateSessionDto = {
        password: 'wrongPassword',
        phoneNumber: 'phoneNumber',
      };

      mockUserRepository.findOne = jest.fn().mockResolvedValue({
        ...mockUser,
        role: UserRole.PROVIDER,
      });

      mockProviderService.findProviderByUserId = jest.fn().mockResolvedValue({
        id: 'providerId',
      });

      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);

      await expect(sessionService.authenticateUser(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return a session response dto on successful authentication', async () => {
      const payload: CreateSessionDto = {
        password: 'password',
        phoneNumber: 'phoneNumber',
      };

      mockUserRepository.findOne = jest.fn().mockResolvedValue({
        ...mockUser,
        role: UserRole.WIIQARE_ADMIN,
      });

      mockPayerService.findPayerByUserId = jest.fn().mockResolvedValue({
        id: 'id',
      });

      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);

      const sessionResponse = await sessionService.authenticateUser(payload);

      expect(sessionResponse).toEqual(
        expect.objectContaining({
          type: UserRole.WIIQARE_ADMIN,
          userId: mockUser.id,
          phoneNumber: mockUser.phoneNumber,
          names: 'ADMIN',
          email: mockUser.email,
          access_token: 'jwtToken',
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should throw an error when a user is not found', async () => {
      mockUserRepository.findOne = jest.fn().mockResolvedValue(undefined);

      await expect(
        sessionService.findOne({
          where: { id: 'id' },
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return the mock user', async () => {
      const user = await sessionService.findOne({
        where: { id: 'id' },
      });

      expect(user).toEqual(mockUser);
    });
  });
});
