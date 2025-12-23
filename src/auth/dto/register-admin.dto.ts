import { PartialType } from "@nestjs/mapped-types";
import { AuthAdminDto } from "./auth-admin.dto";
import { Role } from "src/common/enums/role.enum";
import { IsDate, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class RegisterAdminDto extends PartialType(AuthAdminDto) {
  role: Role;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  createdAt?: Date;
}