import {
  CacheModuleOptions,
  CacheOptionsFactory,
  Injectable,
} from '@nestjs/common';
import { AppConfigService } from 'src/config/app-config.service';

@Injectable()
export class CacheConfig implements CacheOptionsFactory {
  constructor(private readonly configService: AppConfigService) {}

  createCacheOptions(): CacheModuleOptions {
    return this.configService.redisConfigOptions;
  }
}
