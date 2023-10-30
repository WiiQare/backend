import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString
} from 'class-validator';

export class CreateContactDto {

  @IsNotEmpty()
  @IsString()
  fullname: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  object: string;

  @IsNotEmpty()
  @IsString()
  message: string;
}
