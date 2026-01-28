import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ContentModule } from '../content/content.module';

@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost:27017/learnhub?directConnection=true'), ContentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
