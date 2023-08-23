import countryLookup from 'country-code-lookup';

/**
 * This helper function returns a country name based on the country code
 * @param countryCode Country Code
 *
 */

export const getCountryNameFromCode = (countryCode: string) => {
  return countryLookup.byIso(countryCode)?.country;
};
