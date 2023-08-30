import { DataSource } from 'typeorm';
import { PayerController } from './payer.controller';
import { PayerService } from './payer.service';

describe('PayerController', () => {
  it('should be defined', () => {
    const dataSource: DataSource = {} as DataSource;
    const service = new PayerService(dataSource);
    const controller = new PayerController(service);
    expect(controller).toBeDefined();
  });
});
