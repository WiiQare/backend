import { ApiResponseOptions } from '@nestjs/swagger';
import * as crypto from 'crypto';

export const logSuccess = (...data: any[]): void => console.log(`✓ ${data}`);
export const logInfo = (...data: any[]): void => console.info(`→ ${data}`);
export const logError = (...data: any[]): void =>
  console.log('\x1b[31m', `⛔︎ ${data}`);

export const http_statuses = (
  data: { code: string; description: string }[],
): ApiResponseOptions => {
  let joined = 'Error codes: ';

  data.map((item) => {
    joined += `${item.code} , `;
  });

  return { description: joined };
};

export const randomSixDigit = (): string => {
  const randomNumber = Math.floor(Math.random() * 999999) + 1;
  const randomString = randomNumber.toString().padStart(6, '0');
  return randomString;
};

/**
 * This helper function generate random hex string for password reset
 *
 */
export const generateToken = (): string => {
  return crypto.randomBytes(16).toString('hex');
};


/** 
 * This helper function will convert currency using the api
 */
export async function convertCurrency(from: string, amount: number, to: string ) {
  try {
    const Options = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        //this should be moved to env vars
        apikey: `i6sKwItIpG9o1PLxB6nykJ5OFecFsW8X`,
      },
    };

    const response = await fetch(
      `https://api.apilayer.com/exchangerates_data/convert?to=${to}&from=${from}&amount=${amount}`,
      Options,
    );
    const json = await response.json();

    return json;
  } catch (error) {
    return error;
  }
}

export function allowedCurrency(name: string) {
  const allowedSymbols = ['XAF', 'XOF', 'FCFA','CDF'];

  return allowedSymbols.includes(name);
}