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
  ],
  providers: [DashboardService, UsersService, CoursesService, ContentService],
})
export class AdminModule {}
