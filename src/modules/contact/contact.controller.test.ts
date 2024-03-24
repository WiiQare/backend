import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';

describe('ContactController', () => {
  it('should be defined', () => {
    const service: ContactService = {} as ContactService;
    const controller = new ContactController(service);
    expect(controller).toBeDefined();
  });
});
