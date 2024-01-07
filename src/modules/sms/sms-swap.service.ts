import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../../config/app-config.service';

type CallbackFn = (err: any, response: any) => void;

@Injectable()
export class SmsSwapService {
  constructor(private readonly appConfigService: AppConfigService) {
    console.log('initialized sms service');
  }

  async sendSmsTOFriend(
    phoneNumbers: string[],
    names: string,
    referralCode: string,
  ): Promise<void> {
    console.log('Sending SMS to friend', referralCode);
    return;
  }

  async sendVoucherAsAnSMS(
    shortenHash: string,
    phoneNumber: string,
    senderName: string,
    amount: number,
    currency: string,
  ): Promise<void> {
    console.log('Sending voucher as sms', shortenHash);
    return;
  }

  async sendTransactionVerificationTokenBySmsToAPatient(
    token: string,
    phoneNumber: string,
    amount: number,
  ): Promise<void> {
    console.log('Sending transaction verification token as sms', token);
    return;
  }
}
