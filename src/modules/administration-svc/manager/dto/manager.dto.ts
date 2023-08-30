import { Transform } from 'class-transformer';
import { IsNotEmpty, IsEmail, IsString, IsUUID, IsEnum } from 'class-validator';
import { UserRole, UserStatus } from '../../../../common/constants/enums';

export class createManagerDTO {
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class createManagerReponseDTO {
  @IsNotEmpty()
  @IsUUID(4)
  userId: string;

  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @IsNotEmpty()
  @IsEnum(UserRole)
  userRole: UserRole;

  @IsNotEmpty()
  @IsEnum(UserStatus)
  status: UserStatus;
}
