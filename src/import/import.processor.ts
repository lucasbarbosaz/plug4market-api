import { Process, Processor, InjectQueue } from '@nestjs/bull';
import { Job, Queue } from 'bullmq';
import { ImportService } from './import.service';
import * as fs from 'fs';
import csv from 'csv-parser';
import * as ExcelJS from 'exceljs';

@Processor('import-queue')
export class ImportProcessor {
  constructor(
    private readonly importService: ImportService,
    @InjectQueue('import-queue') private importQueue: Queue
  ) { }

  @Process('process-file')
  async handleFile(job: Job) {
    const { filePath, tenantName, sessionId } = job.data; // Added sessionId for logging
    const batchSize = 500;
    let products: any[] = [];

    // Helper to dispatch batch
    const dispatchBatch = async (batch: any[]) => {
      await this.importQueue.add('process-batch', {
        products: batch,
        tenantName,
        sessionId
      });
    };

    try {
      if (filePath.endsWith('.csv')) {
        await new Promise((resolve, reject) => {
          fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', async (data) => {
              products.push(data);
              if (products.length >= batchSize) {
                const batch = [...products];
                products = [];
                dispatchBatch(batch);
              }
            })
            .on('end', async () => {
              if (products.length > 0) {
                await dispatchBatch(products);
              }
              resolve(true);
            })
            .on('error', (err) => reject(err));
        });
      } else if (filePath.endsWith('.xlsx')) {
        // ExcelJS Streaming Reader
        const workbookReader = new ExcelJS.stream.xlsx.WorkbookReader(filePath, {
          entries: 'emit',
          sharedStrings: 'cache',
          hyperlinks: 'ignore',
          styles: 'ignore',
          worksheets: 'emit' // only emit worksheets
        });

        for await (const worksheetReader of workbookReader) {
          let firstRow = true;
          let headers: string[] = [];

          for await (const row of worksheetReader) {
            if (firstRow) {
              // Assume first row is headers
              // Row values are 1-based index in ExcelJS, but accessing `.values` returns array where index 0 might be empty/null depending on ExcelJS version/file.
              // Usually `.values` is [ <empty>, 'Col1', 'Col2' ] if it's 1-based.
              // Let's use specific cell iteration or safe cast.
              // Safest: Iterate over row.cellCount
              headers = (row.values as any[]).slice(1).map(String);
              firstRow = false;
              continue;
            }

            // Map row to object based on headers
            const rowData: any = {};
            const values = (row.values as any[]);

            // Note: values array matches the row cells. 
            // Careful with empty cells.
            headers.forEach((header, index) => {
              // values is 1-based, so index + 1
              rowData[header] = values[index + 1];
            });

            products.push(rowData);
            if (products.length >= batchSize) {
              await dispatchBatch([...products]);
              products = [];
            }
          }
        }

        if (products.length > 0) {
          await dispatchBatch(products);
        }
      }

    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error);
      throw error;
    } finally {
      // Cleanup
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }

  @Process('process-batch')
  async handleBatch(job: Job) {
    const { products, tenantName, sessionId } = job.data;
    await this.importService.processBatch(products, tenantName, sessionId);
  }
}

