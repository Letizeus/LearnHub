import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'

import { AppController } from './app.controller';
import { ExamController } from './add-exams/exam.controller';
import { ExerciseController } from './add-exercises/exercise.controller';

import { AppService } from './app.service';
import { ExamService } from './add-exams/exam.service';
import { Exam } from './add-exams/exam';
import { ExamSchema } from './add-exams/exam';
import { ExerciseService } from './add-exercises/exercise.service';
import { Exercise, ExerciseSchema } from './add-exercises/exercise';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/learnhub?directConnection=true'),
    MongooseModule.forFeature([{
      name: Exam.name, schema: ExamSchema
    }, { name: Exercise.name, schema: ExerciseSchema}]),
  ],
  controllers: [AppController, ExamController, ExerciseController],
  providers: [AppService, ExamService, ExerciseService],
})
export class AppModule {}
