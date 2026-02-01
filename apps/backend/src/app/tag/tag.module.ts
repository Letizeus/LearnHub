import { forwardRef, Module } from '@nestjs/common';
import { TagController } from './tag.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Tag, TagGroup, TagGroupSchema, TagSchema } from '../schema/tag.schema';
import { TagService } from './tag.service';
import { ContentModule } from '../content/content.module';

@Module({
  providers: [TagService],
  controllers: [TagController],
  imports: [
    MongooseModule.forFeature([
      { name: Tag.name, schema: TagSchema },
      { name: TagGroup.name, schema: TagGroupSchema },
    ]),
    forwardRef(() => ContentModule),
  ],
  exports: [TagService, MongooseModule]
})
export class TagModule {}
