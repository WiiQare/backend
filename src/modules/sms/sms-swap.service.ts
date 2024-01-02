import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../../config/app-config.service';

type CallbackFn = (err: any, response: any) => void;

@Injectable()
export class SmsSwapService {
  constructor(private readonly appConfigService: AppConfigService) {
    console.log('initialized sms service');
  }

  sendMessage(params: any, callback: CallbackFn): void {
    console.log('Sending message', params);
    callback(null, 'sent');
  }
}
