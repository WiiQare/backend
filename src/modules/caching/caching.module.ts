import { CacheModule, Global, Module } from '@nestjs/common';
import { CacheConfig } from './cache.config';
import { CachingService } from './caching.service';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useClass: CacheConfig,
    }),
  ],
  providers: [CachingService],
  exports: [CachingService],
})
export class CachingModule {}
