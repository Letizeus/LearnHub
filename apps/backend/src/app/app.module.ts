import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContentModule } from './content/content.module';
import { TagModule } from './tag/tag.module';
import { FolderModule } from './folder/folder.module';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from './shared.module';
import { SeederModule } from './seeder/seeder.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/learnhub?directConnection=true', { autoIndex: true }),
    ContentModule,
    TagModule,
    FolderModule,
    SharedModule,
    SeederModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
