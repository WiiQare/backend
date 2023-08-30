import { DataSource } from 'typeorm';
import { ExporterController } from './exporter.controller';
import { ExporterService } from './exporter.service';

describe('ExporterController', () => {
  it('should be defined', () => {
    const dataSource: DataSource = {} as DataSource;
    const service = new ExporterService(dataSource);
    const controller = new ExporterController(service);
    expect(controller).toBeDefined();
  });
});
