// src/modules/plug4market/dtos/create-product.dto.ts
import { IsString, IsNumber, IsArray, IsOptional, ValidateNested, IsNotEmpty, IsBoolean, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class SalesChannelDto {
  @IsNumber()
  readonly id: number;

  @IsNumber()
  @IsOptional()
  readonly price: number;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  readonly productId: string; // ID do produto no SEU ERP

  @IsString()
  @IsNotEmpty()
  readonly sku: string; // SKU único

  @IsString()
  @IsNotEmpty()
  readonly name: string; // Título do anúncio

  @IsString()
  @IsNotEmpty()
  readonly productName: string; // Nome do agrupador

  @IsNumber()
  readonly price: number; // Preço base

  @IsNumber()
  readonly stock: number; // Estoque inicial

  @IsString()
  readonly description: string; // Aceita HTML

  // Dimensões e Peso
  @IsNumber()
  readonly weight: number;

  @IsNumber()
  readonly width: number;

  @IsNumber()
  readonly height: number;

  @IsNumber()
  readonly length: number;

  @IsString()
  readonly brand: string;

  @IsOptional()
  @IsString()
  readonly ean: string;

  @IsOptional()
  @IsString()
  readonly ncm: string;

  @IsOptional()
  @IsBoolean()
  readonly active: boolean;

  @IsOptional()
  @IsString()
  readonly anatelCode: string;

  @IsOptional()
  @IsString()
  readonly anvisaCode: string;

  @IsOptional()
  @IsString()
  readonly categoryId: string;

  @IsOptional()
  @IsString()
  readonly cest: string;

  @IsOptional()
  @IsString()
  readonly color: string;

  @IsOptional()
  @IsEnum(['novo', 'usado'])
  readonly condition: string;

  @IsOptional()
  @IsNumber()
  readonly costPrice: number;

  @IsOptional()
  @IsNumber()
  readonly crossDockingDays: number;

  @IsOptional()
  @IsString()
  readonly csosn: string;

  @IsOptional()
  readonly customCategory: any; // Object

  @IsOptional()
  @IsString()
  readonly customId: string;

  @IsOptional()
  @IsString()
  readonly ex_tipi: string;

  @IsOptional()
  @IsString()
  readonly fci: string;

  @IsOptional()
  @IsString()
  readonly flavor: string;

  @IsOptional()
  @IsEnum(['masculino', 'feminino', 'menino', 'menina', 'unissex', 'bebe'])
  readonly gender: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly images: string[];

  @IsOptional()
  @IsString()
  readonly inmetroCode: string;

  @IsOptional()
  @IsString()
  readonly manufacturerPartNumber: string;

  @IsOptional()
  @IsString()
  readonly mapaCode: string;

  @IsOptional()
  @IsEnum(['un', 'kg', 'g', 'mg', 'm', 'm²', 'm³', 'cm', 'cm²', 'cm³', 'mm', 'mm²', 'mm³', 'oz', 'lb', 'ft', 'ft²', 'ft³', 'in', 'in²', 'in³'])
  readonly measurementUnit: string;

  @IsOptional()
  @IsArray()
  readonly metafields: any[]; // Array of objects

  @IsOptional()
  @IsString()
  readonly model: string;

  @IsOptional()
  @IsString()
  readonly modelo: string; // ID

  @IsOptional()
  @IsEnum(['nacional', 'importado'])
  readonly origin: string;

  @IsOptional()
  @IsString()
  readonly potency: string;

  @IsOptional()
  @IsBoolean()
  readonly reviewed: boolean;

  @IsOptional()
  @IsString()
  readonly saleDateEnd: string;

  @IsOptional()
  @IsString()
  readonly saleDateStart: string;

  @IsOptional()
  @IsNumber()
  readonly salePrice: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SalesChannelDto)
  readonly salesChannels: SalesChannelDto[];

  @IsOptional()
  @IsString()
  readonly size: string;

  @IsOptional()
  @IsNumber()
  readonly unitMultiplier: number;

  @IsOptional()
  @IsString()
  readonly voltage: string;

  @IsOptional()
  @IsNumber()
  readonly warranty: number;
}