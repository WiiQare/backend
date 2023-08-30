import { DataSource, Repository } from 'typeorm';
import { Transaction } from '../../smart-contract/entities/transaction.entity';
import { PaymentService } from './payment.service';

describe('PaymentService', () => {
  it('should be defined', () => {
    const txRepo: Repository<Transaction> = {} as Repository<Transaction>;
    const dataSource: DataSource = {} as DataSource;
    const service = new PaymentService(txRepo, dataSource);
    expect(service).toBeDefined();
  });
});
