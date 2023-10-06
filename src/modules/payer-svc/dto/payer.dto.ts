import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsISO31661Alpha2,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
import { InviteType } from 'src/common/constants/enums';

export class CreatePayerAccountDto {
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @IsNotEmpty()
  @IsString()
  emailVerificationToken: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsISO31661Alpha2()
  country: string;
}

export class SearchPatientDto {
  @IsOptional()
  phoneNumber?: string;

  @IsOptional()
  @IsUUID()
  payerId?: string;
}

export class SendInviteDto {
  @IsNotEmpty()
  @IsEnum(InviteType)
  inviteType: InviteType;

  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  emails?: string[];

  @IsOptional()
  @IsString({ each: true })
  phoneNumbers: string[];
}

export class SendSmsVoucherDto {
  @IsNotEmpty()
  @IsString()
  @Length(8, 8)
  shortenHash: string;
}

export class KYCDto {
  @IsNotEmpty()
  @IsString()
  expire: string;

  @IsNotEmpty()
  @IsString()
  cardID: string;

  @IsNotEmpty()
  @IsString()
  birthday: string;

  @IsNotEmpty()
  @IsBoolean()
  kyc: boolean;
}