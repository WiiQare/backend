import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_NAME, AUTO_FORGOT_TTL } from '../common/constants/constants';
import {
  Environment,
  EnvironmentVariables,
} from './dto/environment-variables.dto';

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

  get dbPort(): number {
    return this.configService.get<number>('DB_PORT');
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

  get isSSLEnabled(): boolean {
    return this.environment == Environment.Production;
  }

  get dbCertificateAuthority(): string | undefined {
    return this.configService.get<string | undefined>('DATABASE_CA');
  }

  get dbCertificateKey(): string | undefined {
    return this.configService.get<string | undefined>('DATABASE_KEY');
  }

  get dbCertificate(): string | undefined {
    return this.configService.get<string | undefined>('DATABASE_CERT');
  }

  // redis caching service
  get redisConfigOptions() {
    return {
      ttl: AUTO_FORGOT_TTL,
      //TODO: fix incompatibility with cache-manager-redis-store later!
      // store: redisStore,
      host: this.configService.get('REDIS_HOST'),
      port: this.configService.get('REDIS_PORT'),
      password: this.configService.get('REDIS_PASSWORD'),
      prefix: `${APP_NAME}:`,
    };
  }

  get hashingSecret(): string {
    return this.configService.get('HASHING_SECRET');
  }
  get stripeWebHookSecret(): string {
    return this.configService.get('STRIPE_WEBHOOK_SECRET');
  }

  get smartContractPrivateKey(): string {
    return this.configService.get('SMART_CONTRACT_PRIVATE_KEY');
  }

  get smartContractAddress(): string {
    return this.configService.get('SMART_CONTRACT_ADDRESS');
  }

  get blockChainNodeURI(): string {
    return this.configService.get('BLOCK_CHAIN_NODE_URI');
  }

  get smtpPassword(): string {
    return this.configService.get('SMTP_PASSWORD');
  }

  get smsApiKey(): string {
    return this.configService.get('SMS_API_KEY');
  }

  get objectStorageUrl(): string {
    return this.configService.get('MINIO_ENDPOINT');
  }
  get objectStoragePort(): number {
    return this.configService.get('MINIO_PORT');
  }

  get objectStorageAccessKey(): string {
    return this.configService.get('MINIO_ACCESS_KEY');
  }

  get objectStorageSecretKey(): string {
    return this.configService.get('MINIO_SECRET_KEY');
  }
}
