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
import {
  UserRole,
  UserStatus,
  BusinessType,
} from '../../common/constants/enums';
import {
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { _400, _401, _403, _404 } from '../../common/constants/errors';
import { DAY } from '../../common/constants/constants';
import { Provider } from '../provider-svc/entities/provider.entity';
import { Payer } from '../payer-svc/entities/payer.entity';

jest.mock('bcrypt');

describe('SessionService', () => {
  // Mock user entity
  const mockUser: User = {
    id: 'id',
    updatedAt: new Date(),
    createdAt: new Date(),
    email: 'email',
    phoneNumber: 'phoneNumber',
    username: 'username',
    role: UserRole.PAYER,
    status: UserStatus.ACTIVE,
    password: 'password',
    savings: [],
  };

  // Mock payer entity
  const mockPayer: Payer = {
    id: 'id',
    updatedAt: new Date(),
    createdAt: new Date(),
    firstName: 'firstName',
    lastName: 'lastName',
    user: mockUser,
    country: 'country',
    homeAddress: 'homeAddress',
    referralCode: 'referralCode',
    kyc: false,
  };

  // Mock provider entity
  const mockProvider: Provider = {
    id: 'id',
    updatedAt: new Date(),
    createdAt: new Date(),
    name: 'name',
    email: 'email',
    address: 'address',
    phone: 'phone',
    city: 'city',
    postalCode: 'postalCode',
    nationalId: 'nationalId',
    businessRegistrationNo: 123,
    businessType: BusinessType.HOSPITAL,
    user: {
      ...mockUser,
      role: UserRole.PROVIDER,
    },
    logoLink: 'logoLink',
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
        new BadRequestException(_400.MALFORMED_INPUTS_PROVIDED),
      );
    });

    it('should throw an error when user is not found', async () => {
      const payload: CreateSessionDto = {
        password: 'password',
        phoneNumber: 'phoneNumber',
      };

      mockUserRepository.findOne = jest.fn().mockResolvedValue(undefined);

      await expect(sessionService.authenticateUser(payload)).rejects.toThrow(
        new NotFoundException(_404.USER_NOT_FOUND),
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
        new ForbiddenException(_403.USER_ACCOUNT_NOT_ACTIVE),
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
        new NotFoundException(_404.PAYER_NOT_FOUND),
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
        new UnauthorizedException(_401.INVALID_CREDENTIALS),
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
        new NotFoundException(_404.PROVIDER_NOT_FOUND),
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
        new UnauthorizedException(_401.INVALID_CREDENTIALS),
      );
    });

    it('should return a session response dto on successful admin authentication', async () => {
      const payload: CreateSessionDto = {
        password: 'password',
        phoneNumber: 'phoneNumber',
      };

      mockUserRepository.findOne = jest.fn().mockResolvedValue({
        ...mockUser,
        role: UserRole.WIIQARE_ADMIN,
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

    it('should return a session response dto on successful manager authentication', async () => {
      const payload: CreateSessionDto = {
        password: 'password',
        phoneNumber: 'phoneNumber',
      };

      mockUserRepository.findOne = jest.fn().mockResolvedValue({
        ...mockUser,
        role: UserRole.WIIQARE_MANAGER,
      });

      const sessionResponse = await sessionService.authenticateUser(payload);

      expect(sessionResponse).toEqual(
        expect.objectContaining({
          userId: mockUser.id,
          type: UserRole.WIIQARE_MANAGER,
          phoneNumber: mockUser.phoneNumber,
          names: 'MANAGER',
          email: mockUser.email,
          access_token: 'jwtToken',
        }),
      );
    });

    it('should return a session response dto on successful provider authentication', async () => {
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
        .mockResolvedValue(mockProvider);

      const sessionResponse = await sessionService.authenticateUser(payload);

      expect(sessionResponse).toEqual(
        expect.objectContaining({
          userId: mockUser.id,
          providerId: mockUser.id,
          type: UserRole.PROVIDER,
          phoneNumber: mockUser.phoneNumber,
          names: mockProvider.name,
          email: mockUser.email,
          access_token: 'jwtToken',
        }),
      );
    });

    it('should return a session response dto on successful payer authentication', async () => {
      const payload: CreateSessionDto = {
        password: 'password',
        phoneNumber: 'phoneNumber',
      };

      mockUserRepository.findOne = jest.fn().mockResolvedValue(mockUser);

      mockPayerService.findPayerByUserId = jest
        .fn()
        .mockResolvedValue(mockPayer);

      const sessionResponse = await sessionService.authenticateUser(payload);

      expect(sessionResponse).toEqual(
        expect.objectContaining({
          userId: mockUser.id,
          payerId: mockUser.id,
          type: UserRole.PAYER,
          phoneNumber: mockUser.phoneNumber,
          names: mockPayer.firstName + ' ' + mockPayer.lastName,
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
      ).rejects.toThrow(new NotFoundException(_404.USER_NOT_FOUND));
    });

    it('should return the mock user', async () => {
      const user = await sessionService.findOne({
        where: { id: 'id' },
      });

      expect(user).toEqual(mockUser);
    });
  });

  describe('emailVerification', () => {
    it('should throw an error if user already exists', async () => {
      await expect(
        sessionService.emailVerification(mockUser.email),
      ).rejects.toThrow(
        new ForbiddenException(_403.USER_ACCOUNT_ALREADY_EXIST),
      );
    });

    it('should send a OTP email', async () => {
      mockUserRepository.findOne = jest.fn().mockResolvedValue(undefined);

      await sessionService.emailVerification('newEmail');

      expect(mockCachingService.save).toHaveBeenCalledWith(
        expect.any(String),
        'newEmail',
        180_000,
      );
      expect(mockMailService.sendOTPEmail).toHaveBeenCalledWith(
        'newEmail',
        expect.any(String),
      );
    });
  });

  describe('validateEmailOTP', () => {
    it('should throw a ForbiddenException when OTP is invalid', async () => {
      jest.spyOn(sessionService, 'isValidOTP').mockResolvedValue(false);

      await expect(
        sessionService.validateEmailOTP('testEmail', 123456),
      ).rejects.toThrow(new ForbiddenException(_403.OTP_VERIFICATION_FAILED));
    });

    it('should return SessionVerifyEmailOTPResponseDto when OTP is valid', async () => {
      jest.spyOn(sessionService, 'isValidOTP').mockResolvedValue(true);
      jest
        .spyOn(sessionService, 'generateEmailVerificationHash')
        .mockReturnValue('emailVerificationToken');
      jest.spyOn(mockCachingService, 'save').mockResolvedValue();

      const response = await sessionService.validateEmailOTP(
        'testEmail',
        123456,
      );

      expect(response).toEqual({
        emailVerificationToken: 'emailVerificationToken',
      });

      expect(mockCachingService.save).toHaveBeenCalledWith(
        `wiiQare:email:verify:testEmail`,
        `testEmail:123456`,
        900_000,
      );
    });
  });

  describe('isValidOTP', () => {
    it('should return true if OTP is valid', async () => {
      jest.spyOn(mockCachingService, 'get').mockResolvedValue('testEmail');

      const isValid = await sessionService.isValidOTP(123456, 'testEmail');

      expect(isValid).toBe(true);
    });

    it('should return false if OTP is invalid', async () => {
      jest.spyOn(mockCachingService, 'get').mockResolvedValue(undefined);

      const isValid = await sessionService.isValidOTP(123456, 'testEmail');

      expect(isValid).toBe(false);
    });
  });

  describe('hashDataToHex', () => {
    it('should return a hashed string', () => {
      const hashedString = sessionService.hashDataToHex('testString');

      expect(hashedString).toEqual(
        '918fecfd7a5ef212ae34b4b30396f66991f3664a49e163b5a64c75a7b065b9ca757fef75aa96b8c5c6a72f4606b230d9577ce02f171471c2c88f8988f3e90e12',
      );
    });
  });

  describe('generateEmailVerificationHash', () => {
    it('should return a hashed string', () => {
      const hashedString = sessionService.generateEmailVerificationHash(
        'testString',
        123456,
      );

      expect(hashedString).toEqual(expect.any(String));
    });
  });

  describe('resetPassword', () => {
    it('should throw an error if user is not found', async () => {
      mockUserRepository.findOne = jest.fn().mockResolvedValue(undefined);

      await expect(sessionService.resetPassword('testEmail')).rejects.toThrow(
        new NotFoundException(_404.USER_NOT_FOUND),
      );
    });

    it('should send a reset password email', async () => {
      mockUserRepository.findOne = jest.fn().mockResolvedValue(mockUser);

      await sessionService.resetPassword('email');

      expect(mockCachingService.save).toHaveBeenCalledWith(
        expect.any(String),
        mockUser.email,
        DAY,
      );
      expect(mockMailService.sendResetPasswordEmail).toHaveBeenCalledWith(
        mockUser.email,
        expect.any(String),
      );
    });
  });

  describe('updatePassword', () => {
    const updatePasswordDto = {
      password: 'password',
      confirmPassword: 'password',
      resetPasswordToken: 'resetPasswordToken',
    };

    it('should throw an error if cachedToken is not found', async () => {
      mockCachingService.get = jest.fn().mockResolvedValue(undefined);

      await expect(
        sessionService.updatePassword(updatePasswordDto),
      ).rejects.toThrow(new ForbiddenException(_403.INVALID_RESET_TOKEN));
    });

    it('should throw an error if user is not found', async () => {
      mockCachingService.get = jest.fn().mockResolvedValue('email');
      mockUserRepository.findOne = jest.fn().mockResolvedValue(undefined);

      await expect(
        sessionService.updatePassword(updatePasswordDto),
      ).rejects.toThrow(new NotFoundException(_404.USER_NOT_FOUND));
    });

    it('should throw an error if password and confirmPassword do not match', async () => {
      mockCachingService.get = jest.fn().mockResolvedValue('email');
      mockUserRepository.findOne = jest.fn().mockResolvedValue(mockUser);

      await expect(
        sessionService.updatePassword({
          ...updatePasswordDto,
          confirmPassword: 'confirmPassword',
        }),
      ).rejects.toThrow(new BadRequestException(_400.PASSWORD_MISMATCH));
    });

    it('should update the user password', async () => {
      const hashedPassword = 'hashedPassword';
      jest.spyOn(bcrypt, 'hashSync').mockReturnValue(hashedPassword);
      mockCachingService.get = jest.fn().mockResolvedValue('email');
      mockUserRepository.findOne = jest.fn().mockResolvedValue(mockUser);
      mockUserRepository.save = jest
        .fn()
        .mockResolvedValue({ ...mockUser, password: hashedPassword });

      const result = await sessionService.updatePassword(updatePasswordDto);

      expect(mockUserRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        password: hashedPassword,
      });
      expect(result).toEqual({
        status: 200,
        userId: 'id',
        message: 'Password updated successfully',
      });
    });
  });
});
