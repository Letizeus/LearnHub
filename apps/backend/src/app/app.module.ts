import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'

import { AppController } from './app.controller';
import { ExamController } from './add-exams/exam.controller';
import { ExerciseController } from './add-exercises/exercise.controller';

import { AppService } from './app.service';
import { ExerciseService } from './add-exercises/exercise.service';
import { Exercise, ExerciseSchema } from '../models/exercise';
import { LearningContent, LearningContentSchema } from '../models/learning-content';
import { LearningContentCollection, LearningContentCollectionSchema } from '../models/learning-content-collection';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/learnhub?directConnection=true'),
    MongooseModule.forFeature([
      {name: LearningContentCollection.name, schema: LearningContentCollectionSchema},
      {name: LearningContent.name, schema: LearningContentSchema},
      {name: Exercise.name, schema: ExerciseSchema}
    ]),
  ],
  controllers: [AppController, ExamController, ExerciseController],
  providers: [AppService, ExerciseService],
})
export class AppModule {}
