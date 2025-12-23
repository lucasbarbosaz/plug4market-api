import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();

    const userRole = request.token.role;

    // Super Admin pode acessar qualquer rota
    if (userRole === Role.SUPER_ADMIN) return true;

    // OWNER_STORE pode acessar qualquer rota de USER
    if (userRole === Role.OWNER_STORE && requiredRoles.includes(Role.USER)) return true;

    const hasPermission = requiredRoles.some((role) => role === userRole);

    if (!hasPermission) {
      throw new ForbiddenException('Acesso negado: você não tem a permissão necessária.');
    }

    return true;
  }
}