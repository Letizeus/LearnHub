import { forwardRef, Module } from '@nestjs/common';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ExerciseSchema,
  LearningContentCollectionSchema,
  LearningContentSchema,
} from '../schema/learning-content.schema';
import { LEARNING_CONTENT_COLLECTION_NAME, LEARNING_CONTENT_NAME } from 'models';
import { TagModule } from '../tag/tag.module';

@Module({
  providers: [ContentService],
  controllers: [ContentController],
  imports: [
    MongooseModule.forFeature([
      { name: LEARNING_CONTENT_COLLECTION_NAME, schema: LearningContentCollectionSchema },
      {
        name: LEARNING_CONTENT_NAME,
        schema: LearningContentSchema,
        discriminators: [{ name: 'EXERCISE', schema: ExerciseSchema }],
      },
    ]),
    forwardRef(() => TagModule)
  ],
  exports: [
    ContentService,
    MongooseModule
  ]
})
export class ContentModule {}
