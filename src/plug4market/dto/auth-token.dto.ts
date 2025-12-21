import { IsEmpty } from "class-validator";

export class AuthTokenDto {
  @IsEmpty({ message: "O campo login é obrigatório" })
  login: string;

  @IsEmpty({ message: "O campo senha é obrigatório" })
  password: string;
}