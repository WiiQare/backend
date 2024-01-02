import { Module } from '@nestjs/common';
import { SmsService } from './sms.service';
import { MessageBirdService } from './messagebird.service';

// swap MessageBirdService with SmsSwapService for another sms service - platform independence

@Module({
  imports: [],
  providers: [SmsService, MessageBirdService],
  exports: [SmsService],
})
export class SMSModule {}
