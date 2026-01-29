import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Category,
  CategorySchema,
  Content,
  ContentSchema,
  Course,
  CourseSchema,
  User,
  UserSchema,
  PlatformConfig,
  PlatformConfigSchema,
} from './schemas';
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
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Course.name, schema: CourseSchema },
      { name: Content.name, schema: ContentSchema },
      { name: Category.name, schema: CategorySchema },
      { name: PlatformConfig.name, schema: PlatformConfigSchema },
    ]),
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
