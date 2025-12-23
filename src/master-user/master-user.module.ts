import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { MasterUserService } from './master-user.service';
import { CreateSuperAdminMiddleware } from 'src/common/middlewares/create-superadmin.middleware';
import { MasterUserController } from './master-user.controller';

@Module({
  providers: [MasterUserService],
  exports: [MasterUserService],
  controllers: [MasterUserController]
})
export class MasterUserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CreateSuperAdminMiddleware)
      .forRoutes({
        path: 'master-user/register-admin',
        method: RequestMethod.POST,
      }, {
        path: 'master-user/login-admin',
        method: RequestMethod.POST,
      }, {
        path: 'master-user/logout-admin',
        method: RequestMethod.POST,
      })
  }
}
