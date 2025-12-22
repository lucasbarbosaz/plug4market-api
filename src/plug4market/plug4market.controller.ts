import { Body, Controller, Delete, Get, Post, Patch, Query, Param } from '@nestjs/common';
import { CreateStoreDto } from './dto/create-store.dto';
import { Plug4MarketService } from './plug4market.service';
import { TypedHeaders } from './decorators/typed-headers.decorator';
import { TenantHeadersDto } from './dto/headers.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsDto } from './dto/list-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SkuDto } from './dto/sku.dto';

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

  @Patch('products/:sku')
  async updateProduct(@Body() updateProductDto: UpdateProductDto, @Param() skuDto: SkuDto, @TypedHeaders(TenantHeadersDto) headers: TenantHeadersDto) {
    return this.plug4marketService.updateProduct(updateProductDto, skuDto, headers.tenantName);
  }

  @Delete('products/:sku')
  async deleteProduct(@Param() deleteProductDto: SkuDto, @TypedHeaders(TenantHeadersDto) headers: TenantHeadersDto) {
    return this.plug4marketService.deleteProduct(deleteProductDto, headers.tenantName);
  }
}
