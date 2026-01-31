import { Module } from '@nestjs/common';
import { ContentModule } from '../../content/content.module';
import { UsersModule } from '../../users/users.module';
import { DashboardController } from './controllers/dashboard.controller';
import { DashboardService } from './services/dashboard.service';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { CoursesController } from './controllers/courses.controller';
import { CoursesService } from './services/courses.service';
import { ContentController } from './controllers/content.controller';
import { ContentService } from './services/content.service';
import { TagGroupsController } from './controllers/taggroups.controller';
import { TagGroupsService } from './services/taggroups.service';

@Module({
  imports: [
    ContentModule,
    UsersModule,
  ],
  controllers: [
    DashboardController,
    UsersController,
    CoursesController,
    ContentController,
    TagGroupsController,
  ],
  providers: [DashboardService, UsersService, CoursesService, ContentService, TagGroupsService],
})
export class AdminModule {}
