import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CreateSuperAdminMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const secretHeader = req.headers['x-secret'];

    if (secretHeader !== process.env.SECRET_HEADER) {
      return res.status(401).json({ message: 'Acesso negado' });
    }

    next();
  }
}
