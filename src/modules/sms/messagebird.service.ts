import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../../config/app-config.service';
import {
  Message,
  MessageBird,
  MessageParameters,
  initClient,
} from 'messagebird';

type CallbackFn = (err: any, response: any) => void;

@Injectable()
export class MessageBirdService {
  messageBird: MessageBird;
  constructor(private readonly appConfigService: AppConfigService) {
    this.messageBird = initClient(this.appConfigService.smsApiKey);
  }

  sendMessage(params: MessageParameters, callback: CallbackFn ): void {
    this.messageBird.messages.create(params, callback);
  }
}
