import { Transform } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { SavingFrequency, SavingType } from '../entities/saving.entity';

export class CreateSavingDto {

  @IsNotEmpty()
  @IsString()
  user: string;
  
  @IsNotEmpty()
  @IsEnum(SavingType)
  type: SavingType;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  currency: string;

  @IsNotEmpty()
  @IsEnum(SavingFrequency)
  frequency: SavingFrequency;

  @IsOptional()
  @IsArray()
  operations: any;
}
