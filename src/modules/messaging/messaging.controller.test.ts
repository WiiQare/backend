import { MessagingController } from './messaging.controller';
import { MessagingService } from './messaging.service';

describe('MessagingController', () => {
  it('should be defined', () => {
    const service: MessagingService = {} as MessagingService;
    const controller = new MessagingController(service);
    expect(controller).toBeDefined();
  });
});
