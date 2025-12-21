import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { Plug4MarketModule } from '../plug4market/plug4market.module';
import { TenantsMiddleware } from 'src/common/middlewares/tenants.middleware';

@Module({
  imports: [PrismaModule, Plug4MarketModule],
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
