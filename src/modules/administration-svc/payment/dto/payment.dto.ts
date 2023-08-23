import {
  IsString,
  IsUUID,
  IsDateString,
  IsNumber,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { PaymentTotalsInfo } from '../../_common_';

export class PaymentSummaryDTO {
  @ValidateNested()
  payerPaymentsInOneWeek: PaymentTotalsInfo;

  @ValidateNested()
  payerPaymentsInOneMonth: PaymentTotalsInfo;

  @ValidateNested()
  payerPaymentsInThreeMonths: PaymentTotalsInfo;

  @ValidateNested()
  payerPaymentsInSixMonths: PaymentTotalsInfo;

  @ValidateNested()
  payerPaymentsMax: PaymentTotalsInfo;

  @ValidateNested()
  claimedVouchers: PaymentTotalsInfo;

  @IsNumber()
  totalProviderPayments: PaymentTotalsInfo;

  @IsNumber()
  totalRevenue?: number;

  @IsNumber()
  numberOFPayerPayments: number;

  @IsNumber()
  numberOfProviderPayments: number;
}

export class PayerPaymentsDTO {
  @IsUUID()
  transactionId: string;

  @IsDateString()
  transactionDate: string;

  @IsNumber()
  paymentValue: number;

  @IsString()
  payerCountry: string;

  @IsDateString()
  beneficiaryCountry: string;
}

export class ProviderPaymentsDTO {
  @IsUUID()
  transactionId: string;

  @IsDateString()
  transactionDate: string;

  @IsString()
  providerName: string;

  @IsUUID()
  providerId: string;

  @IsString()
  providerCity: string;

  @IsString()
  providerCountry: string;

  @IsBoolean()
  transactionStatus?: boolean;

  @IsNumber()
  voucherAmountInLocalCurrency: number;

  @IsNumber()
  voucherAmountInSenderCurrency: number; // in EUR
}
