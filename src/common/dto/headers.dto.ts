import { IsString, IsNotEmpty } from 'class-validator';
import { Expose } from 'class-transformer';

export class TenantHeadersDto {
  @IsString()
  @IsNotEmpty()
  @Expose({ name: 'x-tenant-name' })
  readonly tenantName: string;
}