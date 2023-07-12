import { IsString, IsUUID, IsNumber, ValidateNested } from 'class-validator';
import { VoucherTotalsInfo } from '../../_common_';

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
  @IsString()
  voucherId: string;

  @IsNumber()
  amountInLocalCurrency: number;

  @IsNumber()
  amountInSenderCurrency: number;

  @IsUUID()
  payerId: string;

  @IsUUID()
  beneficiaryId: string;

  @IsUUID()
  voucherOwnerId: string;

  @IsString()
  voucherStatus: string;
}
