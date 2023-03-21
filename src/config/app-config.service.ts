import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Environment,
  EnvironmentVariables,
} from './dto/environment-variables.dto';
import { APP_NAME } from '../common/constants/constants';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService<EnvironmentVariables>) {}

  get appName(): string {
    return APP_NAME;
  }
  get port(): number {
    return this.configService.get<number>('PORT');
  }

  get environment(): string {
    return this.configService.get<string>('NODE_ENV');
  }

  get tokenSecretKey(): string {
    return this.configService.get<string>('TOKEN_SECRET_KEY');
  }

  get tokenExpiration(): string {
    return this.configService.get<string>('TOKEN_EXPIRATION');
  }

  get dbHost(): string {
    return this.configService.get<string>('DB_HOST');
  }

  get dbPort(): string {
    return this.configService.get<string>('DB_PORT').toString();
  }

  get dbUser(): string {
    return this.configService.get<string>('DB_USER');
  }

  get dbPass(): string {
    return this.configService.get<string>('DB_PASS');
  }

  get dbName(): string {
    return this.configService.get<string>('DB_NAME');
  }
  get isProduction(): boolean {
    return this.environment == Environment.Production;
  }
}
