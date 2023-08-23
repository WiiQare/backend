import { DataSource } from 'typeorm';
import { ChartsService } from './charts.service';

describe('ChartsService', () => {
  it('should be defined', () => {
    const dataSource: DataSource = {} as DataSource;
    const service = new ChartsService(dataSource);
    expect(service).toBeDefined();
  });
});
