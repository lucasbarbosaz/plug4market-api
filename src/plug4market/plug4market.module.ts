import { Module } from '@nestjs/common';
import { Plug4MarketService } from './plug4market.service';
import { HttpModule } from '@nestjs/axios';
import { Plug4MarketController } from './plug4market.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BullModule } from '@nestjs/bull';
import { TokenRefreshTasks } from './tasks/token-refresh.task';
import { TokenProcessor } from './processors/token.processor';
import { HttpConfigService } from '../common/http/http-config.service';

@Module({
  imports: [
    HttpModule.register({
      baseURL: 'https://api.sandbox.plug4market.com.br'
    }),
    PrismaModule,
    BullModule.registerQueue({
      name: 'token-refresh',
      limiter: {
        max: 5,         // No máximo 5 processos
        duration: 60000 // A cada 1 minuto (60.000 ms)
      },
    }),
  ],
  providers: [
    Plug4MarketService,
    TokenRefreshTasks,
    TokenProcessor,
    HttpConfigService
  ],
  controllers: [Plug4MarketController],
  exports: [Plug4MarketService],
})
export class Plug4MarketModule { }
