import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from './config/jwt.config';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from '../prisma/prisma.module';
import { BcryptService } from './hash/bcrypt.service';
import { HashingServiceProtocol } from './hash/hashing.service';
import { MasterUserModule } from '../master-user/master-user.module';

@Global() //nao precisa importar em outros modulos
@Module({
  imports: [
    HttpModule.register({
      baseURL: 'https://api.sandbox.plug4market.com.br'
    }),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    HttpModule,
    PrismaModule,
    MasterUserModule
  ],
  providers: [
    AuthService,
    {
      provide: HashingServiceProtocol,
      useClass: BcryptService
    }
  ],
  exports: [
    AuthService,
    JwtModule,
    ConfigModule.forFeature(jwtConfig),
    HashingServiceProtocol

  ],
  controllers: [AuthController]
})
export class AuthModule { }
