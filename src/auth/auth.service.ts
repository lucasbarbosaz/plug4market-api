import { forwardRef, Inject, Injectable, ParseIntPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { HelperPayloadDto } from './dto/helper-payload.dto';
import { Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateStoreDto } from './dto/create-store.dto';
import { TenantService } from 'src/prisma/tenants.service';
import { Role } from 'src/common/enums/role.enum';
import { PrismaClient as MasterClient } from '@prisma/client-master';
import { AuthAdminDto } from './dto/auth-admin.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { MasterUserService } from 'src/master-user/master-user.service';
import { HashingServiceProtocol } from './hash/hashing.service';

@Injectable()
export class AuthService {
  private masterClient: MasterClient;
  private readonly logger = new Logger(AuthService.name);
  private token: string | null = null;
  private tokenExpiration: number | null = null;

  //24 horas
  private readonly TOKEN_TTL = 24 * 60 * 60 * 1000;

  constructor(
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly jwtService: JwtService,
    private readonly tenantService: TenantService,
    private readonly httpService: HttpService,
    @Inject(forwardRef(() => MasterUserService))
    private readonly masterUserService: MasterUserService,
    private readonly hashingService: HashingServiceProtocol

  ) {
    this.masterClient = new MasterClient();
  }

  public async loginAdmin(authAdminDto: AuthAdminDto) {
    const user = await this.masterUserService.findUserByEmail(authAdminDto.email);

    if (!user) {
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
    }

    if (!this.hashingService.compare(authAdminDto.password, user.password)) {
      throw new HttpException('Senha incorreta', HttpStatus.BAD_REQUEST);
    }

    const { accessToken, refreshToken } = await this.generateTokens({
      id: user.id,
      role: Role.SUPER_ADMIN,
    });

    await this.masterUserService.updateRefreshToken(user.id, refreshToken);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  public async logoutAdmin(userId: number) {
    await this.masterUserService.updateRefreshToken(userId, "");
    return {
      message: "Logout realizado com sucesso",
    };
  }

  public async registerSuperAdmin(registerAdminDto: RegisterAdminDto) {
    if (!registerAdminDto.email) {
      throw new HttpException('Email é obrigatório', HttpStatus.BAD_REQUEST);
    }

    const existingUser = await this.masterUserService.findUserByEmail(registerAdminDto.email).catch(() => null);

    if (existingUser) {
      throw new HttpException('Usuário já existe', HttpStatus.BAD_REQUEST);
    }

    const newUser = await this.masterUserService.createUser(registerAdminDto);

    const { accessToken, refreshToken } = await this.generateTokens({
      id: newUser.id,
      role: Role.SUPER_ADMIN,
    });

    await this.masterUserService.updateRefreshToken(newUser.id, refreshToken);

    return {
      user: newUser,
      accessToken,
      refreshToken,
    };
  }

  private async getAuthToken(): Promise<string> {
    const now = Date.now();

    if (this.token && this.tokenExpiration && now < this.tokenExpiration) {
      return this.token;
    }


    const payload = {
      login: process.env.PLUG4MARKET_LOGIN,
      password: process.env.PLUG4MARKET_PASSWORD,
    };

    try {
      const { data } = await firstValueFrom(
        this.httpService.post('/auth/login', payload),
      );

      this.token = `Bearer ${data.accessToken}`;
      this.tokenExpiration = now + this.TOKEN_TTL;

      this.logger.log('Token Plug4Market obtido com sucesso');

      return this.token;
    } catch (error) {
      this.logger.error(
        'Erro ao autenticar no Plug4Market',
        error?.response?.data || error.message,
      );

      throw new HttpException(
        'Falha ao autenticar no Plug4Market',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  public async createNewStore(createStoreDto: CreateStoreDto, tenantName: string) {
    this.logger.log('Iniciando criação de loja no Plug4Market');

    const token = await this.getAuthToken();


    try {
      const { data } = await firstValueFrom(
        this.httpService.post('/stores', createStoreDto, {
          headers: {
            Authorization: token,
          },
        }),
      );

      if (!data) {
        throw new HttpException(
          'Falha ao criar loja no Plug4Market',
          HttpStatus.BAD_REQUEST,
        );
      }

      const tokenStore = await this.createTokenStore(createStoreDto.cnpj, createStoreDto.cnpjSH);

      const prisma = await this.tenantService.getTenantClient(tenantName);


      const tokenApi = await this.generateToken({
        id: data.storeIdMarketPlace,
        role: Role.USER,
      });

      const novaLoja = await prisma.plugmarket_loja_config.create({
        data: {
          empresaId: createStoreDto.empresaId,
          cnpj: data.cnpj,
          plugId: data.storeIdMarketPlace,
          tokenHub: data.tokenHub,
          accessToken: tokenStore.accessToken,
          refreshToken: tokenStore.refreshToken,
          token_api: tokenApi,
          active: 1
        },
      });


      return novaLoja;


    } catch (error) {
      this.logger.error(
        'Erro ao criar loja no Plug4Market',
        error?.response?.data || error.message,
      );

      if (error.response) {
        throw new HttpException(
          error.response.data,
          error.response.status,
        );
      }
    }
  }

  private async createTokenStore(cnpjLoja: string, cnpjSH: string) {
    this.logger.log('Iniciando criação de token de loja no Plug4Market');

    const token = await this.getAuthToken();

    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`/stores/${cnpjLoja}/software-houses/${cnpjSH}/token`, {
          headers: {
            Authorization: token,
          },
          params: {
            notEncoded: true,
          },
        }),
      );

      return data;
    } catch (error) {
      this.logger.error(
        'Erro ao criar token de loja no Plug4Market',
        error?.response?.data || error.message,
      );

      if (error.response) {
        throw new HttpException(
          error.response.data,
          error.response.status,
        );
      }
      throw error;
    }
  }

  async generateToken(payload: HelperPayloadDto) {
    const token = await this.jwtService.signAsync(
      {
        sub: payload.id,
        role: payload.role,
      },
      {
        secret: this.jwtConfiguration.secret,
        expiresIn: this.jwtConfiguration.jwtTtl as any,
        issuer: this.jwtConfiguration.issuer,
        audience: this.jwtConfiguration.audience,
      },
    );
    return token;
  }

  async generateTokens(payload: HelperPayloadDto) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: payload.id,
          role: payload.role,
        },
        {
          secret: this.jwtConfiguration.secret,
          expiresIn: '1d',
          issuer: this.jwtConfiguration.issuer,
          audience: this.jwtConfiguration.audience,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: payload.id,
          role: payload.role,
        },
        {
          secret: this.jwtConfiguration.secret,
          expiresIn: '7d',
          issuer: this.jwtConfiguration.issuer,
          audience: this.jwtConfiguration.audience,
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
