import { DataSource, Repository } from 'typeorm';
import { VoucherController } from './voucher.controller';
import { VoucherService } from './voucher.service';
import { Transaction } from 'src/modules/smart-contract/entities/transaction.entity';

describe('VoucherController', () => {
  it('should be defined', () => {
    const txRepo: Repository<Transaction> = {} as Repository<Transaction>;
    const dataSource: DataSource = {} as DataSource;
    const service = new VoucherService(txRepo, dataSource);
    const controller = new VoucherController(service);
    expect(controller).toBeDefined();
  });
});
