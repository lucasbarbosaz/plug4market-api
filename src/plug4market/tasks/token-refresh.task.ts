// src/modules/plug4market/tasks/token-refresh.task.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { TenantService } from '../../prisma/tenants.service';

@Injectable()
export class TokenRefreshTasks {
  private readonly logger = new Logger(TokenRefreshTasks.name);

  constructor(
    private readonly tenantService: TenantService,
    @InjectQueue('token-refresh') private readonly tokenQueue: Queue,
  ) { }

  @Cron(CronExpression.EVERY_HOUR)
  async handleTokenRefresh() {
    try {
      this.logger.log('Buscando clientes ativos no SQLite para agendar refresh...');

      // Busca slugs (pastadados) do banco Master (SQLite)
      const allTenantIds = await this.tenantService.getAllActiveTenantIds();

      for (const tenantId of allTenantIds) {
        await this.tokenQueue.add(
          'refresh-job',
          { tenantId },
          {
            attempts: 3, // Se falhar por erro de rede, tenta 3 vezes
            backoff: 5000 // Espera 5 segundos entre tentativas
          }
        );
      }

      this.logger.log(`${allTenantIds.length} tarefas de refresh adicionadas à fila.`);
    } catch (error) {
      this.logger.error('Erro ao executar job de refresh:', error);
    }
  }
}