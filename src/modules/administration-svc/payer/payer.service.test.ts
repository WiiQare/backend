import { DataSource } from 'typeorm';
import { PayerService } from './payer.service';

describe('PayerService', () => {
  it('should be defined', () => {
    const dataSource: DataSource = {} as DataSource;
    const service = new PayerService(dataSource);
    expect(service).toBeDefined();
  });
});
