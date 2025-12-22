import { IsNotEmpty, IsString } from "class-validator";

export class SkuDto {
  @IsString()
  @IsNotEmpty()
  readonly sku: string;
}