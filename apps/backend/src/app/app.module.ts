import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContentModule } from './content/content.module';
import { TagModule } from './tag/tag.module';
import { FolderModule } from './folder/folder.module';
import { SharedModule } from './shared.module';
import { SeederModule } from './seeder/seeder.module';
import { AdminModule } from './admin/admin.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env['MONGO_URI'] || process.env['MONGO_URI'] ||'mongodb://127.0.0.1:27017/learnhub?directConnection=true', { autoIndex: true }),
    ContentModule,
    TagModule,
    FolderModule,
    SharedModule,
    SeederModule,
    UsersModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
