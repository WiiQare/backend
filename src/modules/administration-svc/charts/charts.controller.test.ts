import { DataSource } from 'typeorm';
import { ChartsService } from './charts.service';
import { ChartsController } from './charts.controller';

describe('ChartsController', () => {
  it('should be defined', () => {
    const dataSource: DataSource = {} as DataSource;
    const service = new ChartsService(dataSource);
    const controller = new ChartsController(service);
    expect(controller).toBeDefined();
  });
});
