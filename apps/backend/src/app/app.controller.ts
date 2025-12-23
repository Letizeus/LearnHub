import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service';
import { Multer } from 'multer';
import { AiService } from './ai/ai.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly aiService: AiService
  ) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { message: 'Keine Datei hochgeladen' };
    }
    const base64 = file.buffer.toString('base64');
    const base64Full = `data:${file.mimetype};base64,${base64}`;
    return {
      response: await this.aiService.convertToDocumentFormat([base64]),
      image: base64Full,
    };
    //const base64Data = file.size;
    //return await this.aiService.convertToDocumentFormat([base64Data]);
  }
}
