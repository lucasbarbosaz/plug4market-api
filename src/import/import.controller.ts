import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException, Logger } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bullmq';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { TypedHeaders } from 'src/plug4market/decorators/typed-headers.decorator';
import { TenantHeadersDto } from 'src/common/dto/headers.dto';
import { TenantService } from 'src/prisma/tenants.service';
import { v4 as uuidv4 } from 'uuid';

@Controller('import')
export class ImportController {
  private readonly logger = new Logger(ImportController.name);

  constructor(
    @InjectQueue('import-queue') private importQueue: Queue,
    private tenantService: TenantService
  ) { }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './upload_tmp',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(csv|xlsx)$/)) {
        return cb(new BadRequestException('Only CSV or XLSX files are allowed!'), false);
      }
      cb(null, true);
    }
  }))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @TypedHeaders(TenantHeadersDto) headers: TenantHeadersDto) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const sessionId = uuidv4();
    try {
      const prisma = await this.tenantService.getTenantClient(headers.tenantName);
      await prisma.importSession.create({
        data: {
          id: sessionId,
          file_name: file.originalname,
          status: 'processing'
        }
      });
    } catch (error) {
      this.logger.error(`Failed to create import session for tenant ${headers.tenantName}: ${error.message}`);
      throw new BadRequestException(`Could not initialize import session: ${error.message}`);
    }

    // Dispatch Master Job
    await this.importQueue.add('process-file', {
      filePath: file.path,
      tenantName: headers.tenantName,
      sessionId
    });

    return { message: 'File uploaded and processing started', jobId: file.filename, sessionId };
  }
}
