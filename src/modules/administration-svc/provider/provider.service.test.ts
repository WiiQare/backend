import { DataSource } from 'typeorm';
import { ProviderService } from './provider.service';

describe('ProviderService', () => {
  it('should be defined', () => {
    const dataSource: DataSource = {} as DataSource;
    const service = new ProviderService(dataSource);
    expect(service).toBeDefined();
  });
});
