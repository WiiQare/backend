import { DataSource, Repository } from 'typeorm';
import { Transaction } from '../../smart-contract/entities/transaction.entity';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

describe('PaymentController', () => {
  it('should be defined', () => {
    const txRepo: Repository<Transaction> = {} as Repository<Transaction>;
    const dataSource: DataSource = {} as DataSource;
    const service = new PaymentService(txRepo, dataSource);
    const controller = new PaymentController(service);
    expect(controller).toBeDefined();
  });
});
