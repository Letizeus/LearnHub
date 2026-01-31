import { Module } from '@nestjs/common';
import { TagController } from './tag.controller';
import { MockService } from '../mock.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Tag, TagGroup, TagGroupSchema, TagSchema } from '../schema/tag.schema';
import { ContentModule } from '../content/content.module';
import { FolderModule } from '../folder/folder.module';
import { Folder, FolderSchema } from '../schema/folder.schema';
import {
  ExerciseSchema,
  LearningContent,
  LearningContentCollection,
  LearningContentCollectionSchema,
  LearningContentSchema,
} from '../schema/learning-content.schema';
import { TagService } from './tag.service';
import { ContentService } from '../content/content.service';
import { EmbeddingService } from '../embedding.service';
import { FolderService } from '../folder/folder.service';

@Module({
  providers: [MockService, TagService, ContentService, EmbeddingService, FolderService],
  controllers: [TagController],
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
export class TagModule {}
