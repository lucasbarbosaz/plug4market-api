import { Type } from "class-transformer";
import { IsEmail, IsNotEmpty, IsObject, IsString, IsBoolean, IsOptional, IsArray, ArrayMaxSize, IsInt } from "class-validator";

class AddressDto {
  @IsString({
    message: 'street deve ser uma string'
  })
  @IsNotEmpty({
    message: 'street é obrigatório'
  })
  readonly street: string;

  @IsString({
    message: 'number deve ser uma string'
  })
  @IsNotEmpty({
    message: 'number é obrigatório'
  })
  readonly number: string;

  @IsString({
    message: 'complement deve ser uma string'
  })
  @IsNotEmpty({
    message: 'complement é obrigatório'
  })
  readonly complement: string;

  @IsString({
    message: 'neighborhood deve ser uma string'
  })
  @IsNotEmpty({
    message: 'neighborhood é obrigatório'
  })
  readonly neighborhood: string;

  @IsString({
    message: 'city deve ser uma string'
  })
  @IsNotEmpty({
    message: 'city é obrigatório'
  })
  readonly city: string;

  @IsString({
    message: 'state deve ser uma string'
  })
  @IsNotEmpty({
    message: 'state é obrigatório'
  })
  readonly state: string;

  @IsString()
  @IsNotEmpty()
  readonly cep: string;
}

class ResponsibleDto {
  @IsString({
    message: 'name deve ser uma string'
  })
  @IsNotEmpty({
    message: 'name é obrigatório'
  })
  readonly name: string;

  @IsString({
    message: 'email deve ser uma string'
  })
  @IsEmail()
  @IsNotEmpty({
    message: 'email é obrigatório'
  })
  readonly email: string;

  @IsString({
    message: 'phone deve ser uma string'
  })
  @IsNotEmpty({
    message: 'phone é obrigatório'
  })
  readonly phone: string;
}
export class CreateStoreDto {
  @IsString({
    message: 'cnpjSH deve ser uma string'
  })
  @IsNotEmpty({
    message: 'cnpjSH é obrigatório'
  })
  readonly cnpjSH: string;

  @IsInt({
    message: 'empresaId deve ser um número'
  })
  @IsNotEmpty({
    message: 'empresaId é obrigatório'
  })
  @Type(() => Number)
  readonly empresaId: number;

  @IsObject({
    message: 'address deve ser um objeto'
  })
  @IsNotEmpty({
    message: 'address é obrigatório'
  })
  readonly address: AddressDto;

  @IsString({
    message: 'cnpj deve ser uma string'
  })
  @IsNotEmpty({
    message: 'cnpj é obrigatório'
  })
  readonly cnpj: string;

  @IsString({
    message: 'companyName deve ser uma string'
  })
  @IsNotEmpty({
    message: 'companyName é obrigatório'
  })
  readonly companyName: string;

  @IsObject({
    message: 'address deve ser um objeto'
  })
  @IsNotEmpty({
    message: 'address é obrigatório'
  })
  readonly responsible: ResponsibleDto;

  @IsString({
    message: 'tradingName deve ser uma string'
  })
  @IsNotEmpty({
    message: 'tradingName é obrigatório'
  })
  readonly tradingName: string;

  @IsBoolean({
    message: 'active deve ser um booleano'
  })
  @IsOptional({
    message: 'active é opcional'
  })
  readonly active?: boolean;

  @IsOptional({
    message: 'hubUserEmails é opcional'
  })
  @IsArray({
    message: 'hubUserEmails deve ser um array'
  })
  @ArrayMaxSize(50, { message: 'Máximo de 50 emails permitidos' })
  @IsEmail({}, { each: true, message: 'Todos os emails devem ser válidos' })
  readonly hubUserEmails?: string[];

  @IsString({
    message: 'stateRegistration deve ser uma string'
  })
  @IsOptional({
    message: 'stateRegistration é opcional'
  })
  readonly stateRegistration?: string;

  @IsInt({
    message: 'userId deve ser um número'
  })
  @IsNotEmpty({
    message: 'userId é obrigatório'
  })
  @Type(() => Number)
  readonly usuarioId: number;

}