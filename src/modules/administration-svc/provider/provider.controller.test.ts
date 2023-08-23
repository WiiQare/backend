import { DataSource } from 'typeorm';
import { ProviderController } from './provider.controller';
import { ProviderService } from './provider.service';

describe('ProviderController', () => {
  it('should be defined', () => {
    const dataSource: DataSource = {} as DataSource;
    const service = new ProviderService(dataSource);
    const controller = new ProviderController(service);
    expect(controller).toBeDefined();
  });
});
