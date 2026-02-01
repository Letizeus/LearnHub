import { Module } from '@nestjs/common';
import { FolderController } from './folder.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Folder, FolderSchema } from '../schema/folder.schema';
import { FolderService } from './folder.service';

@Module({
  controllers: [FolderController],
  imports: [
    MongooseModule.forFeature([
      { name: Folder.name, schema: FolderSchema },
    ]),
  ],
  providers: [FolderService],
  exports: [FolderService]
})
export class FolderModule {}
