import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateProductDto } from 'src/plug4market/dto/create-product.dto';
import { IsNotEmpty, IsString } from 'class-validator';

// 1. All fields from CreateProductDto become optional
class PartialProductDto extends PartialType(CreateProductDto) { }

// 2. We only strictly require SKU. 
// However, since CreateProductDto already has SKU as required, 
// and PartialType makes everything optional, we need to re-enforce SKU if we want strict validation.
// User said: "Crie um ImportProductDto onde todos os campos são opcionais, exceto o sku."
export class ImportProductDto extends PartialProductDto {
  @IsString()
  @IsNotEmpty()
  sku: string;
}
