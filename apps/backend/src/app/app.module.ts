import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'

import { AppController } from './app.controller';
import { ExamController } from './add-exams/exam.controller';

import { AppService } from './app.service';
import { ExamService } from './add-exams/exam.service';
import { Exam } from './add-exams/exam';
import { ExamSchema } from './add-exams/exam';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/learnhub?directConnection=true'),
    MongooseModule.forFeature([{
      name: Exam.name, schema: ExamSchema
    }]),
  ],
  controllers: [AppController, ExamController],
  providers: [AppService, ExamService],
})
export class AppModule {}
