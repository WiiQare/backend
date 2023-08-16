import {
  IsString,
  IsUUID,
  IsNumber,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { VoucherTotalsInfo } from '../../_common_';
import { Transform } from 'class-transformer';

export class VoucherSummaryDTO {
  @ValidateNested()
  vouchersInOneWeek: VoucherTotalsInfo;

  @ValidateNested()
  vouchersInOneMonth: VoucherTotalsInfo;

  @ValidateNested()
  vouchersInThreeMonths: VoucherTotalsInfo;

  @ValidateNested()
  vouchersInSixMonths: VoucherTotalsInfo;

  @ValidateNested()
  vouchersInMaxTime: VoucherTotalsInfo;

  @ValidateNested()
  pendingVouchers: VoucherTotalsInfo;

  @ValidateNested()
  redeemedVouchers: VoucherTotalsInfo;

  @ValidateNested()
  unclaimedVouchers: VoucherTotalsInfo;

  @ValidateNested()
  claimedVouchers: VoucherTotalsInfo;
}

export class VoucherDTO {
  @IsDateString()
  purchasedDate: string;

  @IsString()
  voucherId: string;

  @IsNumber()
  amountInLocalCurrency: number;

  @IsString()
  @Transform(({ value }) => value.toUpperCase())
  localCurrency: string;

  @IsNumber()
  amountInSenderCurrency: number;

  @IsString()
  @Transform(({ value }) => value.toUpperCase())
  senderCurrency: string;

  @IsUUID()
  payerId: string;

  @IsUUID()
  beneficiaryId: string;

  @IsUUID()
  voucherOwnerId: string;

  @IsString()
  voucherStatus: string;
}
