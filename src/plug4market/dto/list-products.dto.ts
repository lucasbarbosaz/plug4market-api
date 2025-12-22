// src/modules/plug4market/dtos/list-products.dto.ts
import { IsOptional, IsString, IsNumber, IsBoolean, IsISO8601, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class ListProductsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  _page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  size?: number = 10;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  ncm?: string;

  @IsOptional()
  @IsString()
  ean?: string;

  @IsOptional()
  @IsString()
  sku?: string;
  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  customId?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;


  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceGte?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceLte?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minimumStock?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  salesChannels?: number;

  @IsOptional()
  @IsString()
  salesChannelStatus?: string;

  @IsOptional()
  @IsISO8601()
  createdStartDate?: string;

  @IsOptional()
  @IsISO8601()
  createdEndDate?: string;

  @IsOptional()
  @IsISO8601()
  updatedStartDate?: string;

  @IsOptional()
  @IsISO8601()
  updatedEndDate?: string;


  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  active?: boolean = true;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasImage?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  outOfStock?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  store?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  onlyError?: boolean;
}