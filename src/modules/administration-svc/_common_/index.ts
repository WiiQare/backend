import { IsNumber } from 'class-validator';

export class VoucherTotalsInfo {
  @IsNumber()
  numberOfVouchers: number;
  @IsNumber()
  value: number;
}

export class PaymentTotalsInfo {
  @IsNumber()
  numberOfPayments: number;
  @IsNumber()
  value: number;
}

export enum PageName {
  BENEFICIARY = 'beneficiaries',
  PAYER = 'payers',
  PROVIDER = 'providers',
  VOUCHER = 'vouchers',
  PROVIDER_PAYMENT = 'provider_payments',
  PAYER_PAYMENT = 'payer_payments',
}
