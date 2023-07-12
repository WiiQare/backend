import { IsNumber } from 'class-validator';
import countryLookup from 'country-code-lookup';

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

/**
 * This helper function returns a country name based on the country code
 * @param countryCode Country Code
 *
 */

export const getCountryNameFromCode = (countryCode: string) => {
  return countryLookup.byIso(countryCode)?.country;
};
