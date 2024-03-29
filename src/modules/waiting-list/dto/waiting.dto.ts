import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString
} from 'class-validator';

export class CreateWaitingDto {

  @IsNotEmpty()
  @IsString()
  fullname: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsString()
  country?: string;
}
