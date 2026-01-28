import { Module } from '@nestjs/common';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { RecommendationService } from './recommendation.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Tag, TagGroup, TagGroupSchema, TagSchema } from './tag.schema';
import {
  ExerciseSchema,
  LearningContent,
  LearningContentCollection,
  LearningContentCollectionSchema,
  LearningContentSchema,
} from './learning-content.schema';
import { SeederService } from './seeder.service';

@Module({
  providers: [ContentService, RecommendationService, SeederService, LearningContent],
  controllers: [ContentController],
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
})
export class ContentModule {}
