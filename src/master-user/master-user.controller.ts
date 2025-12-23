import { Body, Controller, Post } from '@nestjs/common';
import { RegisterAdminDto } from '../auth/dto/register-admin.dto';
import { AuthService } from '../auth/auth.service';
import { AuthAdminDto } from 'src/auth/dto/auth-admin.dto';

@Controller('master-user')
export class MasterUserController {
  constructor(private readonly authService: AuthService) { }

  @Post('login-admin')
  async login(@Body() authAdminDto: AuthAdminDto) {
    return this.authService.loginAdmin(authAdminDto);
  }


  @Post('logout-admin')
  async logout(@Body() userId: number) {
    return this.authService.logoutAdmin(userId);
  }

  @Post('register-admin')
  async register(@Body() registerAdminDto: RegisterAdminDto) {
    return this.authService.registerSuperAdmin(registerAdminDto);
  }
}
