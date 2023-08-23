import { DataSource } from 'typeorm';
import { BeneficiaryService } from './beneficiary.service';

describe('BeneficiaryService', () => {
  it('should be defined', () => {
    const dataSource: DataSource = {} as DataSource;
    const service = new BeneficiaryService(dataSource);
    expect(service).toBeDefined();
  });
});
