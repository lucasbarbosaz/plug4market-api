import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { TypedHeaders } from 'src/plug4market/decorators/typed-headers.decorator';
import { CreateStoreDto } from 'src/auth/dto/create-store.dto';
import { TenantHeadersDto } from 'src/common/dto/headers.dto';
import { AuthService } from './auth.service';
import { AuthTokenGuard } from './guard/auth-token.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Role } from 'src/common/enums/role.enum';


@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) { }

  @UseGuards(AuthTokenGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Post('plug4market/create-store')
  async createStore(@Body() createStoreDto: CreateStoreDto, @TypedHeaders(TenantHeadersDto) headers: TenantHeadersDto) {
    return this.authService.createNewStore(createStoreDto, headers.tenantName);
  }
}
