import { DataSource } from 'typeorm';
import { BeneficiaryController } from './beneficiary.controller';
import { BeneficiaryService } from './beneficiary.service';

describe('BeneficiaryController', () => {
  it('should be defined', () => {
    const dataSource: DataSource = {} as DataSource;
    const service = new BeneficiaryService(dataSource);
    const controller = new BeneficiaryController(service);
    expect(controller).toBeDefined();
  });
});
