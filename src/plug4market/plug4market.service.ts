import { Injectable, HttpException, Logger, Body } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { HttpStatus } from '@nestjs/common';
import { TenantService } from 'src/prisma/tenants.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsDto } from './dto/list-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SkuDto } from './dto/sku.dto';


@Injectable()
export class Plug4MarketService {
  private readonly logger = new Logger(Plug4MarketService.name);


  constructor(
    private readonly httpService: HttpService,
    private readonly tenantService: TenantService,
  ) { }



  public async createProduct(createProductDto: CreateProductDto, tenantName: string) {
    this.logger.log('Iniciando criação de produto no Plug4Market');

    const prisma = await this.tenantService.getTenantClient(tenantName);

    const config = await prisma.plugmarket_loja_config.findFirst({
      where: { active: 1 }
    });

    if (!config || !config.accessToken) {
      throw new HttpException(`Loja ${tenantName} não está integrada ou token inválido.`, HttpStatus.UNAUTHORIZED);
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post('/products', createProductDto, {
          headers: {
            Authorization: `Bearer ${config.accessToken}`,
          },
        }),
      );

      this.logger.log(`Plug4Market Response Status: ${response.status}`);

      const { data } = response;

      return data;
    } catch (error) {
      console.log(error);
      this.logger.error(
        'Erro ao criar produto no Plug4Market',
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

  public async listAllProducts(listProductsDto: ListProductsDto, tenantName: string) {
    this.logger.log('Iniciando listagem de produtos no Plug4Market');

    const prisma = await this.tenantService.getTenantClient(tenantName);

    const config = await prisma.plugmarket_loja_config.findFirst({
      where: { active: 1 }
    });

    if (!config || !config.accessToken) {
      throw new HttpException(`Loja ${tenantName} não está integrada ou token inválido.`, HttpStatus.UNAUTHORIZED);
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get('/products', {
          headers: {
            Authorization: `Bearer ${config.accessToken}`,
          },
          params: listProductsDto,
        }),
      );

      this.logger.log(`Plug4Market Response Status: ${response.status}`);

      const { data } = response;

      return data;
    } catch (error) {
      console.log(error);
      this.logger.error(
        'Erro ao listar produtos no Plug4Market',
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

  public async updateProduct(updateProductDto: UpdateProductDto, skuDto: SkuDto, tenantName: string) {
    this.logger.log('Iniciando atualização de produto no Plug4Market');

    const prisma = await this.tenantService.getTenantClient(tenantName);

    const config = await prisma.plugmarket_loja_config.findFirst({
      where: { active: 1 }
    });

    if (!config || !config.accessToken) {
      throw new HttpException(`Loja ${tenantName} não está integrada ou token inválido.`, HttpStatus.UNAUTHORIZED);
    }

    try {
      const response = await firstValueFrom(
        this.httpService.put(`/products/${skuDto.sku}`, updateProductDto, {
          headers: {
            Authorization: `Bearer ${config.accessToken}`,
          },
        }),
      );

      this.logger.log(`Plug4Market Response Status: ${response.status}`);

      const { data } = response;

      return data;
    } catch (error) {
      console.log(error);
      this.logger.error(
        'Erro ao atualizar produto no Plug4Market',
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

  public async deleteProduct(skuDto: SkuDto, tenantName: string) {
    this.logger.log('Iniciando exclusão de produto no Plug4Market');

    const prisma = await this.tenantService.getTenantClient(tenantName);

    const config = await prisma.plugmarket_loja_config.findFirst({
      where: { active: 1 }
    });

    if (!config || !config.accessToken) {
      throw new HttpException(`Loja ${tenantName} não está integrada ou token inválido.`, HttpStatus.UNAUTHORIZED);
    }

    try {
      const response = await firstValueFrom(
        this.httpService.delete(`/products/${skuDto.sku}`, {
          headers: {
            Authorization: `Bearer ${config.accessToken}`,
          },
        }),
      );

      this.logger.log(`Plug4Market Response Status: ${response.status}`);
      this.logger.log(`Plug4Market Response Data: ${JSON.stringify(response.data)}`);

      const { data } = response;

      return data;
    } catch (error) {
      console.log(error);
      this.logger.error(
        'Erro ao excluir produto no Plug4Market',
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
