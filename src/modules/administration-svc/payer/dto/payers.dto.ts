import {
  IsString,
  IsDateString,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { VoucherTotalsInfo } from '../../_common_';

export class PayerSummaryDTO {
  @IsNumber()
  numberOfRegisteredPayers: number;

  @ValidateNested()
  purchasedVouchers: VoucherTotalsInfo;

  @ValidateNested()
  pendingVouchers: VoucherTotalsInfo;

  @ValidateNested()
  redeemedVouchers: VoucherTotalsInfo;

  @IsNumber()
  numberOfActivePayers: number;

  @IsString()
  currency: string;
}

export class PayerDTO {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  country: string;

  @IsDateString()
  registrationDate: string;

  @IsDateString()
  lastActivityOn: string;

  @IsNumber()
  uniqueBeneficiaryCount: number;

  @ValidateNested()
  purchasedVouchers: VoucherTotalsInfo;

  @ValidateNested()
  pendingVouchers: VoucherTotalsInfo;

  @ValidateNested()
  unclaimedVouchers: VoucherTotalsInfo;

  @ValidateNested()
  redeemedVouchers: VoucherTotalsInfo;

  @IsString()
  currency: string;

  @ValidateNested()
  vouchersNotSent: VoucherTotalsInfo;
}
