import { ConfigService } from '@nestjs/config';
import { AppConfigService } from './app-config.service';
import { EnvironmentVariables } from './dto/environment-variables.dto';

describe('AppConfigService', () => {
  let service: AppConfigService;
  beforeEach(async () => {
    service = new AppConfigService(
      new ConfigService<EnvironmentVariables>({
        PORT: 3000,
        NODE_ENV: 'test',
        TOKEN_SECRET_KEY: 'secret',
        TOKEN_EXPIRATION: '1d',
        DB_HOST: 'localhost',
        DB_PORT: 5432,
        DB_USER: 'postgres',
        DB_PASS: 'postgres',
        DB_NAME: 'postgres',
        DATABASE_CA: 'ca',
        DATABASE_KEY: 'key',
        DATABASE_CERT: 'cert',
        REDIS_HOST: 'localhost',
        REDIS_PORT: 6379,
        REDIS_PASSWORD: 'password',
        HASHING_SECRET: 'secret',
        STRIPE_WEBHOOK_SECRET: 'secret',
        SMART_CONTRACT_PRIVATE_KEY: 'ethprv123',
        SMART_CONTRACT_ADDRESS: 'eth123',
        BLOCK_CHAIN_NODE_URI: 'http://localhost:8545',
        SMTP_PASSWORD: 'password',
        SMS_API_KEY: 'key',
        MINIO_ENDPOINT: 'http://localhost:9000',
        MINIO_PORT: 9000,
        MINIO_ACCESS_KEY: 'key',
        MINIO_SECRET_KEY: 'secret',
      }),
    );
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the app name', () => {
    expect(service.appName).toBeDefined();
  });

  it('should return the port', () => {
    expect(service.port).toBeDefined();
  });

  it('should return the environment', () => {
    expect(service.environment).toBeDefined();
  });

  it('should return the token secret key', () => {
    expect(service.tokenSecretKey).toBeDefined();
  });

  it('should return the token expiration', () => {
    expect(service.tokenExpiration).toBeDefined();
  });

  it('should return the db host', () => {
    expect(service.dbHost).toBeDefined();
  });

  it('should return the db port', () => {
    expect(service.dbPort).toBeDefined();
  });

  it('should return the db user', () => {
    expect(service.dbUser).toBeDefined();
  });

  it('should return the db pass', () => {
    expect(service.dbPass).toBeDefined();
  });

  it('should return the db name', () => {
    expect(service.dbName).toBeDefined();
  });

  it('should return false if not in production', () => {
    expect(service.isProduction).toBeFalsy();
  });

  it('should return false if ssl is not enabled', () => {
    expect(service.isSSLEnabled).toBeFalsy();
  });

  it('should return the DB certificate authority', () => {
    expect(service.dbCertificateAuthority).toBeDefined();
  });

  it('should return the DB key', () => {
    expect(service.dbCertificateKey).toBeDefined();
  });

  it('should return the DB certificate', () => {
    expect(service.dbCertificate).toBeDefined();
  });

  it('should return the redis config options', () => {
    expect(service.redisConfigOptions).toEqual({
      host: 'localhost',
      port: 6379,
      password: 'password',
      prefix: 'wii-qare:',
      ttl: 180,
    });
  });

  it('should return the hashing secret', () => {
    expect(service.hashingSecret).toBeDefined();
  });

  it('should return the Stripe webhook secret', () => {
    expect(service.stripeWebHookSecret).toBeDefined();
  });

  it('should return the Smart Contract private key', () => {
    expect(service.smartContractPrivateKey).toBeDefined();
  });

  it('should return the Smart Contract address', () => {
    expect(service.smartContractAddress).toBeDefined();
  });

  it('should return the blockchain node url', () => {
    expect(service.blockChainNodeURI).toBeDefined();
  });

  it('should return the SMTP password', () => {
    expect(service.smtpPassword).toBeDefined();
  });

  it('should return the SMS API key', () => {
    expect(service.smsApiKey).toBeDefined();
  });

  it('should return the Minio endpoint', () => {
    expect(service.objectStorageUrl).toBeDefined();
  });

  it('should return the Minio port', () => {
    expect(service.objectStoragePort).toBeDefined();
  });

  it('should return the Minio access key', () => {
    expect(service.objectStorageAccessKey).toBeDefined();
  });

  it('should return the Minio secret key', () => {
    expect(service.objectStorageSecretKey).toBeDefined();
  });
});
