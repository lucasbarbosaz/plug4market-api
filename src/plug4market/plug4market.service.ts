import { Injectable, HttpException, Logger, Body } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CreateStoreDto } from './dto/create-store.dto';
import { HttpStatus } from '@nestjs/common';
import { TenantService } from 'src/prisma/tenants.service';

@Injectable()
export class Plug4MarketService {
  private readonly logger = new Logger(Plug4MarketService.name);
  private token: string | null = null;
  private tokenExpiration: number | null = null;

  //24 horas
  private readonly TOKEN_TTL = 24 * 60 * 60 * 1000;


  constructor(
    private readonly httpService: HttpService,
    private readonly TenantService: TenantService
  ) { }

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

      const prisma = await this.TenantService.getTenantClient(tenantName);

      const novaLoja = await prisma.plugmarket_loja_config.create({
        data: {
          empresaId: createStoreDto.empresaId,
          cnpj: data.cnpj,
          plugId: data.storeIdMarketPlace,
          tokenHub: data.tokenHub,
          accessToken: tokenStore.accessToken,
          refreshToken: tokenStore.refreshToken,
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

}
