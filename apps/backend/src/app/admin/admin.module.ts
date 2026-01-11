// TEMP: Schema registration only. No controllers/services yet
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
})
export class AdminModule {}
