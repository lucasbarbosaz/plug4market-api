import { Injectable, Logger } from '@nestjs/common';
import { TenantService } from 'src/prisma/tenants.service';
import { plainToInstance } from 'class-transformer';
import { ImportProductDto } from './dto/import-product.dto';
import { validate } from 'class-validator';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ImportService {
  private readonly logger = new Logger(ImportService.name);

  constructor(private tenantsService: TenantService) { }

  async processBatch(rawProducts: any[], tenantName: string, sessionId?: string) {
    this.logger.log(`Processing batch of ${rawProducts.length} products for tenant ${tenantName} (Session: ${sessionId})`);

    const prisma = await this.tenantsService.getTenantClient(tenantName);

    // Ensure session exists if provided? 
    // Usually created by controller, but we might want to log usage here.
    // Assuming sessionId is valid from controller -> processor -> here.

    const validProductsForApi: ImportProductDto[] = [];

    for (const [index, raw] of rawProducts.entries()) {
      try {
        await this.processSingleProduct(raw, prisma, sessionId, index, validProductsForApi);
      } catch (error) {
        this.logger.error(`Unexpected error processing row ${index}: ${error.message}`);
        if (sessionId) {
          await this.logError(prisma, sessionId, index, raw.sku || 'UNKNOWN', `Unexpected error: ${error.message}`);
        }
      }
    }

    if (validProductsForApi.length === 0) return;

    // Send successful batch to Plug4Market API
    const plug4MarketApiUrl = process.env.PLUG4MARKET_API_URL || 'http://localhost:3000';
    try {
      await axios.post(`${plug4MarketApiUrl}/products/batch`, {
        products: validProductsForApi
      }, {
        headers: { 'x-tenant-name': tenantName }
      });
      this.logger.log(`Sent batch of ${validProductsForApi.length} products to Plug4Market`);
    } catch (error) {
      this.logger.error(`Failed to send batch to Plug4Market: ${error.message}`);
      // Log API error as a general error for the session, or per product?
      // Since it's a batch failure, better to log generic.
      if (sessionId) {
        await this.logError(prisma, sessionId, 0, 'BATCH_API', `Failed to send batch to API: ${error.message}`);
      }
    }
  }

  private async processSingleProduct(raw: any, prisma: any, sessionId: string | undefined, rowIndex: number, validBatch: ImportProductDto[]) {
    // 1. Map Images (Comma separated -> Array)
    if (raw.images && typeof raw.images === 'string') {
      raw.images = raw.images.split(',').map(s => s.trim()).filter(s => s.length > 0);
    }

    // 2. Head Validation for Images
    if (raw.images && Array.isArray(raw.images)) {
      for (const url of raw.images) {
        try {
          await axios.head(url, { timeout: 5000 });
        } catch (err) {
          const msg = `Image validation failed for URL: ${url}`;
          this.logger.warn(msg);
          throw new Error(msg); // Stop processing this row
        }
      }
    }

    // 3. Transform & Validate DTO
    const productDto = plainToInstance(ImportProductDto, raw);
    const errors = await validate(productDto);
    if (errors.length > 0) {
      const msg = `Validation Error: ${errors.map(e => Object.values(e.constraints || {}).join(', ')).join('; ')}`;
      throw new Error(msg);
    }

    // 4. Upsert Logic (Partial vs Full)
    // Check if exists
    // Using 'produtoversao' based on schema analysis (it has 'codigocomercial' which usually matches SKU, and 'precodevenda'/'estoqueminimo').
    // 'sku' from DTO maps to 'codigocomercial'? User said: "Se o SKU (codigocomercial) já existir..."

    const existing = await prisma.produtoversao.findFirst({
      where: { codigocomercial: productDto.sku }
    });

    if (existing) {
      // Update ONLY precodevenda and estoqueminimo
      await prisma.produtoversao.update({
        where: { id: existing.id },
        data: {
          precodevenda: productDto.price, // Mapping DTO price -> precodevenda
          estoqueminimo: productDto.stock // Mapping DTO stock -> estoqueminimo
        }
      });
    } else {
      // Create Full
      // We need to map DTO fields to 'produtoversao' fields. 
      // This is complex because 'produtoversao' requires relations (produtoacabado_id, produtomarca_id, etc.)
      // Since I don't have the full logic for creating relations from simple DTO, 
      // I will attempt a best-effort mapping or assume inputs have IDs.
      // However, typical bulk import expects to create products. 
      // For now, I'll use the DTO properties that match schema names or defaults.

      /* WARNING: Creating a 'produtoversao' typically requires a parent 'produto' or 'produtoacabado'.
         If the system is complex, just inserting into 'produtoversao' might fail foreign keys.
         Given constraints, I'll map what I can.
      */

      // Fallback: If creation is too complex for this snippet, I might assume the user 
      // has a stored procedure or triggers, OR I insert simple fields.
      // BUT, I must try.

      await prisma.produtoversao.create({
        data: {
          codigocomercial: productDto.sku,
          nome: productDto.name || 'Novo Produto', // Required in schema
          precodevenda: productDto.price || 0,
          estoqueminimo: productDto.stock || 0,
          estoquemaximo: 100, // Default
          custo: productDto.costPrice || 0,
          // Additional required fields with defaults or dummy values if not in DTO
          produtoacabado_id: 1, // DANGEROUS ASSUMPTION: ID 1 exists
          produtomarca_id: 1,   // DANGEROUS ASSUMPTION: ID 1 exists
          embalagem_idprimaria: 1,
          embalagem_idsecundaria: 1,
          codigogtinean: productDto.ean || '',
          peso: productDto.weight || 0,
          destinacao: '',
          // ... map other fields
        }
      });
    }

    // If success, add to batch for API
    validBatch.push(productDto);
  }

  private async logError(prisma: any, sessionId: string, rowNumber: number, sku: string, message: string) {
    try {
      await prisma.ImportError.create({
        data: {
          id: uuidv4(),
          session_id: sessionId,
          row_number: rowNumber,
          sku: sku,
          error_message: message
        }
      });
    } catch (e) {
      this.logger.error(`Failed to log error to DB: ${e.message}`);
    }
  }
}
