import { Module } from '@nestjs/common';
import { ContentModule } from '../../content/content.module';
import { UsersModule } from '../../users/users.module';
import { DashboardController } from './controllers/dashboard.controller';
import { DashboardService } from './services/dashboard.service';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { CollectionsController } from './controllers/collections.controller';
import { CollectionsService } from './services/collections.service';
import { ContentController } from './controllers/content.controller';
import { ContentService } from './services/content.service';
import { TagGroupsController } from './controllers/taggroups.controller';
import { TagGroupsService } from './services/taggroups.service';
import { TagsController } from './controllers/tags.controller';
import { TagsService } from './services/tags.service';

@Module({
  imports: [
    ContentModule,
    UsersModule,
  ],
  controllers: [
    DashboardController,
    UsersController,
    CollectionsController,
    ContentController,
    TagGroupsController,
    TagsController,
  ],
  providers: [
    DashboardService,
    UsersService,
    CollectionsService,
    ContentService,
    TagGroupsService,
    TagsService,
  ],
})
export class AdminModule {}
