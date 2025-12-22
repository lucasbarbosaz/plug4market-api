import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

@Injectable()
export class HttpConfigService implements OnModuleInit {
  private readonly logger = new Logger(HttpConfigService.name);

  constructor(private readonly httpService: HttpService) { }

  onModuleInit() {
    const axios: AxiosInstance = this.httpService.axiosRef;

    axios.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const config = error.config as CustomAxiosRequestConfig;
        const response = error.response;

        if (response?.status === 429 && config && !config._retry) {
          config._retry = true;

          const retryAfter = response.headers['retry-after'];
          const delay = retryAfter ? parseInt(retryAfter) * 1000 : 2000;

          this.logger.warn(
            `[HTTP] Erro 429 detectado. Aguardando ${delay}ms para tentar novamente: ${config.method?.toUpperCase()} ${config.url}`
          );

          await new Promise((resolve) => setTimeout(resolve, delay));

          return axios(config);
        }

        return Promise.reject(error);
      },
    );

    this.logger.log('Interceptor HTTP para mitigação de 429 configurado com sucesso.');
  }
}