import { Cache } from 'cache-manager';
import { CachingService } from './caching.service';

describe('CachingService', () => {
  it('should be defined', () => {
    const cache: Cache = {} as Cache;
    const service = new CachingService(cache);
    expect(service).toBeDefined();
  });
});
