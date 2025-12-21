import { Module } from '@nestjs/common';
import { Plug4MarketService } from './plug4market.service';
import { HttpModule } from '@nestjs/axios';
import { Plug4MarketController } from './plug4market.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    HttpModule.register({
      baseURL: 'https://api.sandbox.plug4market.com.br'
    }),
    PrismaModule
  ],
  providers: [Plug4MarketService],
  controllers: [Plug4MarketController],
  exports: [Plug4MarketService],
})
export class Plug4MarketModule { }
