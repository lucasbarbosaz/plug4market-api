import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreateStoreDto } from './dto/create-store.dto';
import { Plug4MarketService } from './plug4market.service';
import { TypedHeaders } from './decorators/typed-headers.decorator';
import { TenantHeadersDto } from './dto/headers.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsDto } from './dto/list-products.dto';

@Controller('plug4market')
export class Plug4MarketController {

  constructor(
    private readonly plug4marketService: Plug4MarketService
  ) { }

  @Post()
  async createStore(@Body() createStoreDto: CreateStoreDto, @TypedHeaders(TenantHeadersDto) headers: TenantHeadersDto) {
    return this.plug4marketService.createNewStore(createStoreDto, headers.tenantName);
  }

  @Post('products')
  async createProduct(@Body() createProductDto: CreateProductDto, @TypedHeaders(TenantHeadersDto) headers: TenantHeadersDto) {
    return this.plug4marketService.createProduct(createProductDto, headers.tenantName);
  }

  @Get('products')
  async getProducts(@Query() listProductsDto: ListProductsDto, @TypedHeaders(TenantHeadersDto) headers: TenantHeadersDto) {
    return this.plug4marketService.listAllProducts(listProductsDto, headers.tenantName);
  }
}
