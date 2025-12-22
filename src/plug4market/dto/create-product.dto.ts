// src/modules/plug4market/dtos/create-product.dto.ts
import { IsString, IsNumber, IsArray, IsOptional, ValidateNested, IsNotEmpty, IsBoolean, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class SalesChannelDto {
  @IsNumber()
  id: number;

  @IsNumber()
  @IsOptional()
  price: number;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  productId: string; // ID do produto no SEU ERP

  @IsString()
  @IsNotEmpty()
  sku: string; // SKU único

  @IsString()
  @IsNotEmpty()
  name: string; // Título do anúncio

  @IsString()
  @IsNotEmpty()
  productName: string; // Nome do agrupador

  @IsNumber()
  price: number; // Preço base

  @IsNumber()
  stock: number; // Estoque inicial

  @IsString()
  description: string; // Aceita HTML

  // Dimensões e Peso
  @IsNumber()
  weight: number;

  @IsNumber()
  width: number;

  @IsNumber()
  height: number;

  @IsNumber()
  length: number;

  @IsString()
  brand: string;

  @IsOptional()
  @IsString()
  ean: string;

  @IsOptional()
  @IsString()
  ncm: string;

  @IsOptional()
  @IsBoolean()
  active: boolean;

  @IsOptional()
  @IsString()
  anatelCode: string;

  @IsOptional()
  @IsString()
  anvisaCode: string;

  @IsOptional()
  @IsString()
  categoryId: string;

  @IsOptional()
  @IsString()
  cest: string;

  @IsOptional()
  @IsString()
  color: string;

  @IsOptional()
  @IsEnum(['novo', 'usado'])
  condition: string;

  @IsOptional()
  @IsNumber()
  costPrice: number;

  @IsOptional()
  @IsNumber()
  crossDockingDays: number;

  @IsOptional()
  @IsString()
  csosn: string;

  @IsOptional()
  customCategory: any; // Object

  @IsOptional()
  @IsString()
  customId: string;

  @IsOptional()
  @IsString()
  ex_tipi: string;

  @IsOptional()
  @IsString()
  fci: string;

  @IsOptional()
  @IsString()
  flavor: string;

  @IsOptional()
  @IsEnum(['masculino', 'feminino', 'menino', 'menina', 'unissex', 'bebe'])
  gender: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images: string[];

  @IsOptional()
  @IsString()
  inmetroCode: string;

  @IsOptional()
  @IsString()
  manufacturerPartNumber: string;

  @IsOptional()
  @IsString()
  mapaCode: string;

  @IsOptional()
  @IsEnum(['un', 'kg', 'g', 'mg', 'm', 'm²', 'm³', 'cm', 'cm²', 'cm³', 'mm', 'mm²', 'mm³', 'oz', 'lb', 'ft', 'ft²', 'ft³', 'in', 'in²', 'in³'])
  measurementUnit: string;

  @IsOptional()
  @IsArray()
  metafields: any[]; // Array of objects

  @IsOptional()
  @IsString()
  model: string;

  @IsOptional()
  @IsString()
  modelo: string; // ID

  @IsOptional()
  @IsEnum(['nacional', 'importado'])
  origin: string;

  @IsOptional()
  @IsString()
  potency: string;

  @IsOptional()
  @IsBoolean()
  reviewed: boolean;

  @IsOptional()
  @IsString()
  saleDateEnd: string;

  @IsOptional()
  @IsString()
  saleDateStart: string;

  @IsOptional()
  @IsNumber()
  salePrice: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SalesChannelDto)
  salesChannels: SalesChannelDto[];

  @IsOptional()
  @IsString()
  size: string;

  @IsOptional()
  @IsNumber()
  unitMultiplier: number;

  @IsOptional()
  @IsString()
  voltage: string;

  @IsOptional()
  @IsNumber()
  warranty: number;
}