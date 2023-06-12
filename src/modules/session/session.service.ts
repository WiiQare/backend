import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import * as bcrypt from 'bcrypt';
import { isEmpty } from 'class-validator';
import * as crypto from 'crypto';
import { _400, _401, _403, _404 } from '../../common/constants/errors';
import { generateToken, randomSixDigit } from '../../helpers/common.helper';
import { User } from '../../modules/session/entities/user.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { APP_NAME, DAY } from '../../common/constants/constants';
import { UserRole, UserStatus } from '../../common/constants/enums';
import { AppConfigService } from '../../config/app-config.service';
import { CachingService } from '../caching/caching.service';
import { MailService } from '../mail/mail.service';
import { PayerService } from '../payer-svc/payer.service';
import { ProviderService } from '../provider-svc/provider-svc.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { JwtClaimsDataDto } from './dto/jwt-claims-data.dto';
import {
  SessionResponseDto,
  SessionVerifyEmailOTPResponseDto,
  UpdatePasswordDto,
} from './dto/session.dto';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
    //TODO: Update this DataSource Later!.
    private readonly appConfigService: AppConfigService,
    private readonly payerService: PayerService,
    private readonly providerService: ProviderService,
    private mailService: MailService,
    private cachingService: CachingService,
  ) { }

  async authenticateUser(
    payload: CreateSessionDto,
  ): Promise<SessionResponseDto> {
    const { password, phoneNumber, username, email } = payload;

    if (isEmpty(phoneNumber) && isEmpty(username) && isEmpty(email))
      throw new BadRequestException({
        ..._400.MALFORMED_INPUTS_PROVIDED,
        description: 'phone number or username or email is missing',
      });

    const user: User = await this.userRepository.findOne({
      where: [{ username }, { email }, { phoneNumber }],
    });

    if (!user) throw new NotFoundException(_404.USER_NOT_FOUND);

    if (user.status !== UserStatus.ACTIVE)
      throw new ForbiddenException(_403.USER_ACCOUNT_NOT_ACTIVE);

    let detailsInformation, otherData;

    if (user.role === UserRole.PAYER) {
      detailsInformation = await this.payerService.findPayerByUserId(user.id);

      if (!detailsInformation)
        throw new NotFoundException(_404.PAYER_NOT_FOUND);

      otherData = {
        ...otherData,
        payerId: detailsInformation.id,
      };

      const isValidPassword = bcrypt.compareSync(password, user.password);

      if (!isValidPassword)
        throw new UnauthorizedException(_401.INVALID_CREDENTIALS);
    }

    if (user.role === UserRole.PROVIDER) {
      detailsInformation = await this.providerService.findProviderByUserId(
        user.id,
      );

      if (!detailsInformation)
        throw new NotFoundException(_404.PROVIDER_NOT_FOUND);

      otherData = {
        ...otherData,
        providerId: detailsInformation.id,
      };

      const isValidPassword = bcrypt.compareSync(password, user.password);

      if (!isValidPassword)
        throw new UnauthorizedException(_401.INVALID_CREDENTIALS);
    }

    //TODO: improve this!.
    let names: string;
    if (user.role === UserRole.WIIQARE_ADMIN) {
      names = 'ADMIN';
    } else if (user.role === UserRole.WIIQARE_MANAGER) {
      names = 'MANAGER';
    } else if (user.role === UserRole.PROVIDER) {
      names = detailsInformation.name;
    } else {
      names = `${detailsInformation.firstName} ${detailsInformation.lastName}`;
    }

    const jwtClaimsData: JwtClaimsDataDto = {
      sub: user.id,
      type: user.role,
      phoneNumber: user.phoneNumber,
      names,
      status: user.status,
      ...otherData,
    } as JwtClaimsDataDto;

    const jsonWebToken = this.jwtService.sign(jwtClaimsData);

    return {
      type: user.role,
      userId: user.id,
      phoneNumber: user.phoneNumber,
      names,
      email: user?.email,
      access_token: jsonWebToken,
      ...otherData,
    } as SessionResponseDto;
  }

  /**
   * This function find one user!
   */
  async findOne(options: FindOneOptions<User>): Promise<User | undefined> {
    const user = await this.userRepository.findOne(options);

    if (!user) throw new NotFoundException(_404.USER_NOT_FOUND);

    return user;
  }

  /**
   * This function generate OTP for email verification
   *  and send it to customer (PAYER,PROVIDER,PATIENT)
   */
  async emailVerification(email: string): Promise<void> {
    // check if user exist
    const userExist = await this.userRepository.findOne({ where: { email } });

    if (userExist)
      throw new ForbiddenException(_403.USER_ACCOUNT_ALREADY_EXIST);

    const randomSixDigits = randomSixDigit();

    const key = `wiiQare:otp:${randomSixDigits}`;
    await this.cachingService.save(key, email, 180_000); //TTL 3min in mms

    return this.mailService.sendOTPEmail(email, randomSixDigits);
  }

  /**
   * This function validate if email and OTP user provided is valid
   * @param email
   * @param otpCode
   */
  async validateEmailOTP(
    email: string,
    otpCode: number,
  ): Promise<SessionVerifyEmailOTPResponseDto> {
    const isValid = await this.isValidOTP(otpCode, email);

    if (!isValid) throw new ForbiddenException(_403.OTP_VERIFICATION_FAILED);

    const emailVerificationToken = this.generateEmailVerificationHash(
      email,
      otpCode,
    );

    // save data we hashed with this we will compute hash again and match it with the provided one.
    await this.cachingService.save(
      `wiiQare:email:verify:${email}`,
      `${email}:${otpCode}`,
      900_000, // TTL 15min in mms
    );

    return {
      emailVerificationToken,
    } as SessionVerifyEmailOTPResponseDto;
  }

  async isValidOTP(otpCode: number, email: string): Promise<boolean> {
    const key = `wiiQare:otp:${otpCode}`;

    //NOTICE: auto-eviction from cache will cause it to fails if expired!.
    const otpOwnerEmail = await this.cachingService.get<string>(key);
    return email === otpOwnerEmail;
  }

  /**
   * This helper function hash given data and return digest in hex
   *
   * @param data
   */
  hashDataToHex(data: string): string {
    const hashSecret = this.appConfigService.hashingSecret;
    const hash = crypto.createHmac('sha512', hashSecret);
    return hash.update(data).digest('hex');
  }

  /**
   * This helper function generate email verification hash
   *
   * @param email
   * @param otpCode
   */
  generateEmailVerificationHash(email: string, otpCode: number): string {
    return this.hashDataToHex(`${email}:${otpCode}`);
  }

  /**
   * This helper function is used to reset and send an email to reset password
   *
   * @param email
   */
  async resetPassword(email: string): Promise<void> {
    // find user with provided password
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) throw new NotFoundException(_404.USER_NOT_FOUND);

    // generate random reset password token
    const resetToken = generateToken();

    // save reset token in cache
    const cacheToken = `${APP_NAME}:reset:${resetToken}`;

    // cache key with 1 day ttl
    await this.cachingService.save(cacheToken, email, DAY);

    // send reset password email with url with token
    await this.mailService.sendResetPasswordEmail(email, resetToken);
  }

  /**
   * This function is used to update password to newest
   *
   */
  async updatePassword(
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<Record<string, any>> {
    const { password, confirmPassword, resetPasswordToken } = updatePasswordDto;

    // validate if token is valid
    const cachedToken = `${APP_NAME}:reset:${resetPasswordToken}`;

    const cachedEmail = await this.cachingService.get<string>(cachedToken);

    if (!cachedEmail) throw new ForbiddenException(_403.INVALID_RESET_TOKEN);

    const user: User = await this.userRepository.findOne({
      where: { email: cachedEmail },
    });

    if (!user) throw new NotFoundException(_404.USER_NOT_FOUND);

    // Validate if password is valid
    if (password !== confirmPassword)
      throw new BadRequestException(_400.PASSWORD_MISMATCH);

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    const updatedUser: User = await this.userRepository.save({
      ...user,
      password: hashedPassword,
    });

    return {
      status: 200,
      userId: updatedUser.id,
      message: 'Password updated successfully',
    };
  }
}
