import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from '../../config/app-config.service';
import { PayerService } from '../payer-svc/payer.service';
import { ProviderService } from '../provider-svc/provider-svc.service';
import { MailService } from '../mail/mail.service';
import { CachingService } from '../caching/caching.service';
import { SessionService } from './session.service';
import { UserRole, UserStatus } from '../../common/constants/enums';

describe('SessionService', () => {
  // Mock user entity
  const mockUser = {
    email: 'email',
    phoneNumber: 'phoneNumber',
    username: 'username',
    role: UserRole.PATIENT,
    status: UserStatus.INACTIVE,
    password: 'password',
  };

  // Mock services
  const mockJwtService = {
    sign: jest.fn(),
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

  beforeEach(async () => {
    jest.clearAllMocks();

    // Mock user repository
    const mockUserRepository = {
      findOne: jest.fn(async () => mockUser),
      save: jest.fn(),
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
});
