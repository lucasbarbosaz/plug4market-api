import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TenantService } from '../../prisma/tenants.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TokenRefreshTasks {
  private readonly logger = new Logger(TokenRefreshTasks.name);

  constructor(
    private readonly tenantService: TenantService,
    private readonly httpService: HttpService
  ) { }

  // Roda de hora em hora para verificar quem precisa de refresh
  @Cron(CronExpression.EVERY_HOUR)
  async handleTokenRefresh() {
    this.logger.log('Iniciando rotina de verificação de tokens...');


    const allTenantIds = await this.tenantService.getAllActiveTenantIds();

    for (const tenantId of allTenantIds) {
      try {
        const isConnected = await this.tenantService.testConnection(tenantId);
        if (!isConnected) {
          //this.logger.warn(`Pular tenant ${tenantId} - Falha na conexão com banco de dados.`);
          continue;
        }

        await this.checkAndRefreshTokenForTenant(tenantId);
      } catch (error) {
        this.logger.error(`Erro ao processar tenant ${tenantId}`, error.stack);
      }
    }
  }

  private async checkAndRefreshTokenForTenant(tenantId: string) {
    const prisma = await this.tenantService.getTenantClient(tenantId);


    const config = await prisma.plugmarket_loja_config.findFirst({
      where: {
        active: 1,
        refreshToken: { not: null }
      }
    });


    if (!config || !config.refreshToken) return;

    console.log(config);

    let lastUpdate: Date;

    if (config.updatedAt) {
      lastUpdate = config.updatedAt;
    } else if (config.createdAt) {
      lastUpdate = config.createdAt;
    } else {
      lastUpdate = new Date(0);
    }

    const now = new Date();

    const diffInHours = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);

    if (diffInHours >= 23) {
      this.logger.log(`Renovando token para o tenant: ${tenantId}`);
      const response = await firstValueFrom(
        this.httpService.post('/auth/refresh', {
          refreshToken: config.refreshToken
        })
      );

      const { accessToken, refreshToken: newRefreshToken } = response.data;

      await prisma.plugmarket_loja_config.update({
        where: { id: config.id },
        data: {
          accessToken: accessToken,
          refreshToken: newRefreshToken,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Token renovado com sucesso para ${tenantId}`);
    } else {
      this.logger.log(`Token não renovado para ${tenantId} - ${diffInHours} horas`);
    }
  }
}