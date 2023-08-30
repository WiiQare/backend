import { MinioService } from 'nestjs-minio-client';
import { ObjectStorageService } from './object-storage.service';

describe('ObjectStorageService', () => {
  it('should be defined', () => {
    const minioService: MinioService = {} as MinioService;
    const service = new ObjectStorageService(minioService);
    expect(service).toBeDefined();
  });
});
