import { Module } from '@nestjs/common';
import { ImportController } from 'src/import/import.controller';
import { ImportService } from 'src/import/import.service';
import { ImportProcessor } from 'src/import/import.processor';
import { BullModule } from '@nestjs/bull';
import { TenantService } from 'src/prisma/tenants.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MasterUserModule } from 'src/master-user/master-user.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'import-queue',
    }),
    PrismaModule,
    MasterUserModule // If needed for tenants access
  ],
  controllers: [ImportController],
  providers: [ImportService, ImportProcessor, TenantService],
})
export class ImportModule { }
