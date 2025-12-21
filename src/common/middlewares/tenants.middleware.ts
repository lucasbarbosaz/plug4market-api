import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const tenantName = req.headers['x-tenant-name'];
    if (!tenantName) {
      return res.status(401).json({ message: 'Tenant name is required' });
    }
    req['tenantName'] = tenantName;
    next();
  }
}
