// tenant.service.ts
import { Injectable, OnModuleDestroy, Scope } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable({ scope: Scope.DEFAULT }) // Singleton para manter o cache
export class TenantService implements OnModuleDestroy {
  private clients = new Map<string, PrismaClient>();

  async getTenantClient(tenantId: string): Promise<PrismaClient> {
    if (this.clients.has(tenantId)) {
      return this.clients.get(tenantId)!;
    }

    const databaseUrl = await this.getConnectionStringForTenant(tenantId);

    const client = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });

    this.clients.set(tenantId, client);

    return client;
  }

  private async getConnectionStringForTenant(tenantId: string): Promise<string> {
    const dbName = `u278758869_${tenantId}`;
    return `mysql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${dbName}`;
  }

  // Limpeza de conexões ao desligar a aplicação
  async onModuleDestroy() {
    for (const client of this.clients.values()) {
      await client.$disconnect();
    }
  }
}