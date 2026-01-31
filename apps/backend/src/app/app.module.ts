import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContentModule } from './content/content.module';
import { TagModule } from './tag/tag.module';
import { FolderModule } from './folder/folder.module';
import { MockService } from './mock.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Folder, FolderSchema } from './schema/folder.schema';
import { Tag, TagGroup, TagGroupSchema, TagSchema } from './schema/tag.schema';
import {
  ExerciseSchema,
  LearningContent,
  LearningContentCollection,
  LearningContentCollectionSchema,
  LearningContentSchema,
} from './schema/learning-content.schema';
import { EmbeddingService } from './embedding.service';
import { ContentService } from './content/content.service';
import { TagService } from './tag/tag.service';
import { FolderService } from './folder/folder.service';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/learnhub?directConnection=true', { autoIndex: true }),
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

    ContentModule,
    TagModule,
    FolderModule,
  ],
  controllers: [AppController],
  providers: [AppService, MockService, EmbeddingService, ContentService, TagService, FolderService],
})
export class AppModule {}
