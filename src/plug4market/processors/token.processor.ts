// src/modules/plug4market/processors/token.processor.ts
import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { TenantService } from '../../prisma/tenants.service';

@Processor('token-refresh')
export class TokenProcessor {
  private readonly logger = new Logger(TokenProcessor.name);

  constructor(
    private readonly tenantService: TenantService,
    private readonly httpService: HttpService,
  ) { }

  @Process('refresh-job')
  async handleRefresh(job: Job<{ tenantId: string }>) {
    const { tenantId } = job.data;

    try {
      const isConnected = await this.tenantService.testConnection(tenantId);
      if (!isConnected) {
        this.logger.warn(`[${tenantId}] Falha na conexão com o MySQL. Pulando...`);
        return;
      }

      const prisma = await this.tenantService.getTenantClient(tenantId);

      const config = await prisma.plugmarket_loja_config.findFirst({
        where: {
          active: 1,
          refreshToken: { not: null },
        },
      });

      if (!config) return;

      const lastUpdate = config.updatedAt || config.createdAt || new Date(0);
      const diffInHours = (new Date().getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);

      if (diffInHours >= 23) {
        this.logger.log(`[${tenantId}] Iniciando renovação de token (Idade: ${diffInHours.toFixed(1)}h)`);

        const response = await firstValueFrom(
          this.httpService.post('https://api.plug4market.com.br/auth/refresh', {
            refreshToken: config.refreshToken,
          })
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        await prisma.plugmarket_loja_config.update({
          where: { id: config.id },
          data: {
            accessToken,
            refreshToken: newRefreshToken,
            updatedAt: new Date(),
          },
        });

        this.logger.log(`[${tenantId}] Token renovado com sucesso.`);
      } else {
        this.logger.debug(`[${tenantId}] Token ainda é válido (${diffInHours.toFixed(1)}h).`);
      }
    } catch (error) {
      this.logger.error(`[${tenantId}] Erro no processamento: ${error.message}`);
      throw error;
    }
  }
}