import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { AUTO_FORGOT_TTL } from '../../common/constants/constants';

/**
 * This class here, plays the role of part of brain LOL.
 *
 * It memorizes and remembers
 */
@Injectable()
export class CachingService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * This function is used to save key in redis cache
   * @param key of Type UUID
   * @param memorize<T>
   * @param ttl auto-delete Type number
   */
  async save<T>(key: string, memorize: T, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, memorize, ttl ?? AUTO_FORGOT_TTL);
  }

  /**
   * This function is used to get value of any saved key from redis cache.
   * @param key of Type UUID
   */
  async get<T>(key: string): Promise<T> {
    return await this.cacheManager.get<T>(key);
  }

  /**
   * This function delete saved key from redis cache.
   * @param key of Type UUID
   */
  async delete(key: string): Promise<any> {
    return this.cacheManager.del(key);
  }
}
