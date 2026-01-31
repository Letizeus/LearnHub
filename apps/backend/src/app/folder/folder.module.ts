import { Module } from '@nestjs/common';
import { FolderController } from './folder.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Folder, FolderSchema } from '../schema/folder.schema';
import { Tag, TagGroup, TagGroupSchema, TagSchema } from '../schema/tag.schema';
import {
  ExerciseSchema,
  LearningContent,
  LearningContentCollection,
  LearningContentCollectionSchema,
  LearningContentSchema,
} from '../schema/learning-content.schema';
import { FolderService } from './folder.service';

@Module({
  controllers: [FolderController],
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
  providers: [FolderService],
})
export class FolderModule {}
