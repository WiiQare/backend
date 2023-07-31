import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import path from 'path';
import { AppConfigService } from 'src/config/app-config.service';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (appConfigService: AppConfigService) => ({
        transport: {
          service: 'gmail',
          auth: {
            user: 'wiiqare@gmail.com',
            pass: appConfigService.smtpPassword,
          },
        },
        defaults: {
          from: '"No Reply" <wiiqare@google.com>',
        },
        template: {
          dir: path.resolve(__dirname, '../../../templates'),
          adapter: new HandlebarsAdapter(), // or new PugAdapter() or new EjsAdapter()
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
