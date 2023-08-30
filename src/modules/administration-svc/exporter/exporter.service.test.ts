import { DataSource } from 'typeorm';
import { ExporterService } from './exporter.service';

describe('ExporterService', () => {
  it('should be defined', () => {
    const dataSource: DataSource = {} as DataSource;
    const service = new ExporterService(dataSource);
    expect(service).toBeDefined();
  });
});
