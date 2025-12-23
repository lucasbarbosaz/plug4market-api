import { CanActivate, ExecutionContext, Inject, UnauthorizedException } from "@nestjs/common";
import { Request } from "express"
import { JwtService } from "@nestjs/jwt";
import { ConfigType } from "@nestjs/config";
import jwtConfig from "../config/jwt.config";

export class AuthTokenGuard implements CanActivate {

  constructor(
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly jwtService: JwtService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenHeader(request);

    if (!token) {
      throw new UnauthorizedException({
        message: 'Token não encontrado'
      });
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, this.jwtConfiguration);

      request.token = payload;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException({
        message: 'Acesso não autorizado'
      });
    }
    return true;
  }

  extractTokenHeader(request: Request) {
    const authorization = request.headers?.authorization;

    if (!authorization || typeof authorization !== 'string') {
      return;
    }

    return authorization.split(" ")[1];
  }
}