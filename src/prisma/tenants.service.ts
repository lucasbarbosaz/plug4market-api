// src/tenancy/tenant.service.ts
import { Injectable, OnModuleDestroy, Scope, OnModuleInit, NotFoundException } from '@nestjs/common';
import { PrismaClient as TenantClient } from '@prisma/client';
import { PrismaClient as MasterClient } from '@prisma/client-master';

@Injectable({ scope: Scope.DEFAULT })
export class TenantService implements OnModuleInit, OnModuleDestroy {

  private clients = new Map<string, TenantClient>();
  private masterClient: MasterClient;

  constructor() {
    this.masterClient = new MasterClient({
      datasources: {
        db: { url: process.env.MASTER_DATABASE_URL }
      }
    });
  }

  async onModuleInit() {
    await this.masterClient.$connect();
  }

  async getTenantClient(tenantSlug: string): Promise<TenantClient> {
    if (this.clients.has(tenantSlug)) {
      return this.clients.get(tenantSlug)!;
    }


    const tenantData = await this.masterClient.cliente.findFirst({
      where: {
        pastadados: tenantSlug,
      },
    });

    if (!tenantData) {
      throw new NotFoundException(`Tenant "${tenantSlug}" não encontrado no registro.`);
    }

    const databaseUrl = `mysql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${tenantData.bancodedados}`;

    const client = new TenantClient({
      datasources: {
        db: { url: databaseUrl },
      },
    });

    // 5. Salva no cache e retorna
    this.clients.set(tenantSlug, client);
    return client;
  }

  async getAllActiveTenantIds(): Promise<string[]> {
    const tenants = await this.masterClient.cliente.findMany({
      where: {
        status_id: 1,
        pastadados: { not: null }
      },
      select: {
        pastadados: true
      }
    });

    return tenants.map(t => t.pastadados as string);
  }

  async testConnection(tenantSlug: string): Promise<boolean> {
    try {
      const client = await this.getTenantClient(tenantSlug);
      await client.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.clients.delete(tenantSlug);
      return false;
    }
  }

  async onModuleDestroy() {
    for (const client of this.clients.values()) {
      await client.$disconnect();
    }
    await this.masterClient.$disconnect();
  }
}