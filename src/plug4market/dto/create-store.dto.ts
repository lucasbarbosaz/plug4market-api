import { Type } from "class-transformer";
import { IsEmail, IsNotEmpty, IsObject, IsString, IsBoolean, IsOptional, IsArray, ArrayMaxSize, IsInt } from "class-validator";

class AddressDto {
  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  number: string;

  @IsString()
  @IsNotEmpty()
  complement: string;

  @IsString()
  @IsNotEmpty()
  neighborhood: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  cep: string;
}

class ResponsibleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;
}
export class CreateStoreDto {
  @IsString()
  @IsNotEmpty()
  cnpjSH: string;

  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  empresaId: number;

  @IsObject()
  @IsNotEmpty()
  address: AddressDto;

  @IsString()
  @IsNotEmpty()
  cnpj: string;

  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsObject()
  @IsNotEmpty()
  responsible: ResponsibleDto;

  @IsString()
  @IsNotEmpty()
  tradingName: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50, { message: 'Máximo de 50 emails permitidos' })
  @IsEmail({}, { each: true, message: 'Todos os emails devem ser válidos' })
  hubUserEmails?: string[];

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  stateRegistration?: string;

}