import {
  IsEmail,
  IsISO31661Alpha2,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreatePatientDto {
  @IsOptional()
  phoneNumber?: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsNotEmpty()
  @IsString()
  homeAddress: string;

  @IsNotEmpty()
  @IsISO31661Alpha2()
  country: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  addedBy?: string
}

export class EditPatientDto extends CreatePatientDto {
  @IsNotEmpty()
  @IsUUID()
  @IsString()
  id: string;
}

export class PatientResponseDto {
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @IsNotEmpty()
  @IsPhoneNumber()
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  email?: string;
}
