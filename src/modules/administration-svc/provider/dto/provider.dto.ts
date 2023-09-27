import {
  IsDateString,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { VoucherTotalsInfo } from '../../_common_';

class TransactionTotalsInfo {
  @IsNumber()
  numberOfTransactions: number;

  @IsNumber()
  value;
}

export class ProviderDTO {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  city: string;

  @IsString()
  country: string;

  @IsDateString()
  registrationDate: string;

  @IsString()
  currency: string;

  @IsString()
  lastBeneficiaryProviderTransaction: string;

  @IsNumber()
  totalNumberOfUniqueBeneficiaries: number;

  @IsNumber()
  totalBeneficiaryProviderTransactionWithinOneWeek: number;

  @IsNumber()
  totalBeneficiaryProviderTransactionWithinOneMonth: number;

  @IsNumber()
  totalBeneficiaryProviderTransactionWithinThreeMonths: number;

  @IsNumber()
  totalBeneficiaryProviderTransactionWithinSixMonths: number;

  @IsNumber()
  totalBeneficiaryProviderTransaction: number;

  @ValidateNested()
  receivedVouchers: VoucherTotalsInfo;

  @ValidateNested()
  unclaimedVouchers: VoucherTotalsInfo;

  @ValidateNested()
  claimedVouchers: VoucherTotalsInfo;

  @ValidateNested()
  redeemedVouchers: VoucherTotalsInfo;
}

export class ProviderSummaryDTO {
  @IsNumber()
  numberOfRegisteredProviders: number;

  @ValidateNested()
  totalBeneficiaryTransactionsWithinOneWeek: TransactionTotalsInfo;
  @ValidateNested()
  totalBeneficiaryTransactionsWithinOneMonth: TransactionTotalsInfo;
  @ValidateNested()
  totalBeneficiaryTransactionsWithinThreeMonths: TransactionTotalsInfo;
  @ValidateNested()
  totalBeneficiaryTransactionsWithinSixMonths: TransactionTotalsInfo;

  @IsNumber()
  totalBeneficiaryProviderTransaction: number;

  @ValidateNested()
  unclaimedVouchers: VoucherTotalsInfo;

  @ValidateNested()
  claimedVouchers: VoucherTotalsInfo;

  @ValidateNested()
  redeemedVouchers: VoucherTotalsInfo;

  @IsNumber()
  totalNumberOfUniqueBeneficiaries: number;

  @IsString()
  currency: string;

  @ValidateNested()
  totalVouchers: VoucherTotalsInfo;
}
