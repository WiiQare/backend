import { NestFactory } from '@nestjs/core';
import 'reflect-metadata';
import { AppModule } from './app.module';
import { enableConfig } from './config/config';
import { AppConfigService } from './config/app-config.service';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  await enableConfig(app);

  const environmentConfig: AppConfigService = app.get(AppConfigService);

  await app.listen(environmentConfig.port, () =>
    console.log(
      ` ${environmentConfig.appName} Service is running on PORT => ${environmentConfig.port} 🎉`,
    ),
  );
}

bootstrap();
