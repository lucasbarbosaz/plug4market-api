import { Body, Controller, Post } from '@nestjs/common';
import { CreateStoreDto } from './dto/create-store.dto';
import { Plug4MarketService } from './plug4market.service';
import { TypedHeaders } from './decorators/typed-headers.decorator';
import { TenantHeadersDto } from './dto/headers.dto';

@Controller('plug4market')
export class Plug4MarketController {

  constructor(
    private readonly plug4marketService: Plug4MarketService
  ) { }

  @Post()
  async createStore(@Body() createStoreDto: CreateStoreDto, @TypedHeaders(TenantHeadersDto) headers: TenantHeadersDto) {
    return this.plug4marketService.createNewStore(createStoreDto, headers.tenantName);
  }
}
