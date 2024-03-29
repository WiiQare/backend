import {
  IsDecimal,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { OperationType } from '../entities/operation.entity';

export class CreateOperationDto {
  @IsNotEmpty()
  @IsString()
  saving: string;

  @IsNotEmpty()
  @IsEnum(OperationType)
  type: OperationType;

  @IsNotEmpty()
  @IsDecimal()
  amount: number;

  @IsNotEmpty()
  @IsString()
  currency: string;
}
