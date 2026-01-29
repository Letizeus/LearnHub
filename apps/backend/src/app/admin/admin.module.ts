import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AdminCategory,
  AdminCategorySchema,
  AdminContent,
  AdminContentSchema,
  AdminCourse,
  AdminCourseSchema,
  AdminUser,
  AdminUserSchema,
  PlatformConfig,
  PlatformConfigSchema,
} from './schemas';
import { DashboardController } from './controllers/dashboard.controller';
import { DashboardService } from './services/dashboard.service';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AdminUser.name, schema: AdminUserSchema },
      { name: AdminCourse.name, schema: AdminCourseSchema },
      { name: AdminContent.name, schema: AdminContentSchema },
      { name: AdminCategory.name, schema: AdminCategorySchema },
      { name: PlatformConfig.name, schema: PlatformConfigSchema },
    ]),
  ],
  controllers: [DashboardController, UsersController],
  providers: [DashboardService, UsersService],
})
export class AdminModule {}
