import { Type } from "class-transformer";
import { IsEmail, IsNotEmpty, IsObject, IsString, IsBoolean, IsOptional, IsArray, ArrayMaxSize, IsInt } from "class-validator";

class AddressDto {
  @IsString()
  @IsNotEmpty()
  readonly street: string;

  @IsString()
  @IsNotEmpty()
  readonly number: string;

  @IsString()
  @IsNotEmpty()
  readonly complement: string;

  @IsString()
  @IsNotEmpty()
  readonly neighborhood: string;

  @IsString()
  @IsNotEmpty()
  readonly city: string;

  @IsString()
  @IsNotEmpty()
  readonly state: string;

  @IsString()
  @IsNotEmpty()
  readonly cep: string;
}

class ResponsibleDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  readonly phone: string;
}
export class CreateStoreDto {
  @IsString()
  @IsNotEmpty()
  readonly cnpjSH: string;

  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  readonly empresaId: number;

  @IsObject()
  @IsNotEmpty()
  readonly address: AddressDto;

  @IsString()
  @IsNotEmpty()
  readonly cnpj: string;

  @IsString()
  @IsNotEmpty()
  readonly companyName: string;

  @IsObject()
  @IsNotEmpty()
  readonly responsible: ResponsibleDto;

  @IsString()
  @IsNotEmpty()
  readonly tradingName: string;

  @IsBoolean()
  @IsOptional()
  readonly active?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50, { message: 'Máximo de 50 emails permitidos' })
  @IsEmail({}, { each: true, message: 'Todos os emails devem ser válidos' })
  readonly hubUserEmails?: string[];

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly stateRegistration?: string;

}