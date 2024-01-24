import { Module } from '@nestjs/common';
import { SmsService } from './sms.service';
import { MessageBirdService } from './messagebird.service';
// import { SmsSwapService } from './sms-swap.service';

// swap SmsService with SmsSwapService for another sms service below - platform independence
// if not using SmsService, also remove MessageBirdService from providers
/* EXAMPLE
Line 13: export class SmsGatewayService extends SmsSwapService {}
Line 17: providers: [SmsGatewayService],
*/
export class SmsGatewayService extends SmsService {}

@Module({
  imports: [],
  providers: [SmsGatewayService, MessageBirdService],
  exports: [SmsGatewayService],
})
export class SMSModule {}
