import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class MintVoucherDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsIn(['USD', 'EURO'])
  currency: string;

  @IsNotEmpty()
  @IsUUID(4)
  ownerId: string;

  @IsNotEmpty()
  @IsUUID(4)
  patientId: string;
}

export class TransferVoucherDto {
  @IsNotEmpty()
  @IsString()
  voucherId: string;

  @IsNotEmpty()
  // @IsUUID(4)
  @IsString()
  ownerId: string;
}

export class SplitVoucherDto {
  @IsNotEmpty()
  @IsString()
  voucherId: string;

  @IsNotEmpty()
  firstVoucher: string;

  @IsNotEmpty()
  secondVoucher: string;
}