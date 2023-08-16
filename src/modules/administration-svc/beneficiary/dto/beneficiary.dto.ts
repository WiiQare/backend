import {
  IsUUID,
  IsString,
  IsDateString,
  IsNumber,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { PaymentTotalsInfo, VoucherTotalsInfo } from '../../_common_';

export class BeneficiaryDTO {
  @IsUUID()
  id: string;

  @IsString()
  name: string;

  @IsString()
  country: string;

  @IsDateString()
  registrationDate: string;

  @IsOptional()
  @IsDateString()
  lastActivityOn?: string;

  @IsNumber()
  totalNumberOfDistinctPayers: number;

  @IsNumber()
  totalNumberOfDistinctProviders: number;

  @IsString()
  currency: string;

  @ValidateNested()
  totalPayment: PaymentTotalsInfo;

  @ValidateNested()
  activeVouchers: VoucherTotalsInfo;

  @ValidateNested()
  pendingVouchers: VoucherTotalsInfo;

  @ValidateNested()
  unclaimedVouchers: VoucherTotalsInfo;

  @ValidateNested()
  redeemedVouchers: VoucherTotalsInfo;
}

export class BeneficiarySummaryDTO {
  @IsNumber()
  numberOfRegisteredBeneficiaries: number;

  @ValidateNested()
  pendingVouchers: VoucherTotalsInfo;

  @ValidateNested()
  redeemedVouchers: VoucherTotalsInfo;

  @ValidateNested()
  totalProviderTransactions: PaymentTotalsInfo;

  @IsNumber()
  numberOfActiveBeneficiaries: number;

  @IsString()
  voucherCurrencies: string;
}
