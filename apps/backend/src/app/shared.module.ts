import { forwardRef, Global, Module } from '@nestjs/common';
import { EmbeddingService } from './embedding.service';
import { ContentModule } from './content/content.module';
import { TagModule } from './tag/tag.module';
import { FolderModule } from './folder/folder.module';

@Global()
@Module({
  imports: [
  ],
  providers: [EmbeddingService],
  exports: [EmbeddingService],
})
export class SharedModule {}