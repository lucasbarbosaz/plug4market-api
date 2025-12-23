// src/modules/plug4market/dtos/list-products.dto.ts
import { IsOptional, IsString, IsNumber, IsBoolean, IsISO8601, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class ListProductsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  readonly _page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  readonly size?: number = 10;

  @IsOptional()
  @IsString()
  readonly q?: string;

  @IsOptional()
  @IsString()
  readonly brand?: string;

  @IsOptional()
  @IsString()
  readonly ncm?: string;

  @IsOptional()
  @IsString()
  readonly ean?: string;

  @IsOptional()
  @IsString()
  readonly sku?: string;
  @IsOptional()
  @IsString()
  readonly productId?: string;

  @IsOptional()
  @IsString()
  readonly customId?: string;

  @IsOptional()
  @IsString()
  readonly categoryId?: string;


  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  readonly priceGte?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  readonly priceLte?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  readonly minimumStock?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  readonly salesChannels?: number;

  @IsOptional()
  @IsString()
  readonly salesChannelStatus?: string;

  @IsOptional()
  @IsISO8601()
  readonly createdStartDate?: string;

  @IsOptional()
  @IsISO8601()
  readonly createdEndDate?: string;

  @IsOptional()
  @IsISO8601()
  readonly updatedStartDate?: string;

  @IsOptional()
  @IsISO8601()
  readonly updatedEndDate?: string;


  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  readonly active?: boolean = true;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  readonly hasImage?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  readonly outOfStock?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  readonly store?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  readonly onlyError?: boolean;
}