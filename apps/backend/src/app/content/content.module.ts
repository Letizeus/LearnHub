import { Module } from '@nestjs/common';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { MockService } from '../mock.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ExerciseSchema,
  LearningContent,
  LearningContentCollection,
  LearningContentCollectionSchema,
  LearningContentSchema,
} from '../schema/learning-content.schema';

import { Folder, FolderSchema } from '../schema/folder.schema';
import { Tag, TagGroup, TagGroupSchema, TagSchema } from '../schema/tag.schema';
import { EmbeddingService } from '../embedding.service';
import { TagService } from '../tag/tag.service';
import { FolderService } from '../folder/folder.service';

@Module({
  providers: [ContentService, MockService, EmbeddingService, TagService, FolderService],
  controllers: [ContentController],
  imports: [
    MongooseModule.forFeature([
      { name: Folder.name, schema: FolderSchema },
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
