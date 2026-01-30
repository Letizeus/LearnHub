import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Tag, TagGroup, TagGroupSchema, TagSchema } from './tag.schema';
import {
  ExerciseSchema,
  LearningContent,
  LearningContentCollection,
  LearningContentCollectionSchema,
  LearningContentSchema,
} from './learning-content.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tag.name, schema: TagSchema },
      { name: TagGroup.name, schema: TagGroupSchema },
      { name: LearningContentCollection.name, schema: LearningContentCollectionSchema },
      {
        name: LearningContent.name,
        schema: LearningContentSchema,
        discriminators: [{ name: 'EXERCISE', schema: ExerciseSchema }],
      },
    ]),
  ],
  exports: [MongooseModule],
})
export class ContentModule {}
