import { forwardRef, Module } from '@nestjs/common';
import { ContentModule } from '../content/content.module';
import { TagModule } from '../tag/tag.module';
import { FolderModule } from '../folder/folder.module';
import { MockService } from './mock.service';

@Module({
    imports: [
        forwardRef(() => ContentModule),
        forwardRef(() => TagModule),
        forwardRef(() => FolderModule)
    ],
    providers: [MockService],
    exports: [MockService]
})
export class SeederModule {}
