import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { Plug4MarketModule } from '../plug4market/plug4market.module';
import { TenantsMiddleware } from 'src/common/middlewares/tenants.middleware';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { AuthModule } from '../auth/auth.module';
import { MasterUserModule } from '../master-user/master-user.module';
import { ImportModule } from '../import/import.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    PrismaModule,
    Plug4MarketModule,
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    MasterUserModule,
    //ImportModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantsMiddleware)
      .forRoutes({
        path: 'plug4market',
        method: RequestMethod.ALL,
      })
  }
}
