import { Logger, Module, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AuthMiddleware } from './user/middleware/auth.middleware';
import { MailService } from './mail/mail.service';
import { MailModule } from './mail/mail.module';
import { SmsService } from './sms/sms.service';
import { SmsController } from './sms/sms.controller';
import { SmsModule } from './sms/sms.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    MongooseModule.forRootAsync({
      useFactory: async () => {
        let uri = process.env.MONGO_URI;

        if (!uri) {
          uri = 'mongodb://localhost/nestjs-user'
        }

        Logger.log(`connecting MongoDb`);

        return {
          uri,
          connectionFactory: (connection) => {
            Logger.log('MongoDB connection started');
            connection.on('connected', () => {
              Logger.log('MongoDB connected');
            });
            connection.on('error', (err) => {
              Logger.error('MongoDB connection error', err);
            });
            connection.on('disconnected', () => {
              Logger.warn('MongoDB disconnected');
            });
            setImmediate(() => {
              switch (connection.readyState) {
                case 1:
                  Logger.log('MongoDB connected');
                  break;
                case 2:
                  Logger.log('MongoDB connecting');
                  break;
                case 0:
                  Logger.warn('MongoDB not connected');
                  break;
                default:
                  Logger.log(`MongoDB state: ${connection.readyState}`, 'Mongoose');
              }
            });
            return connection;
          }
        };
      },
    }),

    UserModule,

    MailModule,

    SmsModule,
  ],
  providers: [MailService, SmsService],
  controllers: [SmsController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware)
      .forRoutes(
        // { path: 'user/profile', method: RequestMethod.GET }
        { path: 'user/reset-password', method: RequestMethod.POST }

      );
  }
}