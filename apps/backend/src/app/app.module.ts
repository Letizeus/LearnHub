import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'

import { AppController } from './app.controller';

import { AppService } from './app.service';
import { Exercise, ExerciseSchema } from '../models/exercise';
import { LearningContent, LearningContentSchema } from '../models/learning-content';
import { LearningContentCollection, LearningContentCollectionSchema } from '../models/learning-content-collection';
import { CreateService } from './services/create.service';
import { LearningContentCollectionController } from './add-learning-content-collection/learning-content-collection.controller';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/learnhub?directConnection=true'),
    MongooseModule.forFeature([
      {name: LearningContentCollection.name, schema: LearningContentCollectionSchema},
      {name: LearningContent.name, schema: LearningContentSchema},
      {name: Exercise.name, schema: ExerciseSchema}
    ]),
  ],
  controllers: [AppController, LearningContentCollectionController],
  providers: [AppService, CreateService],
})
export class AppModule {}
