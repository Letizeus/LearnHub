// TEMP: Schema registration only. No controllers/services yet
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AdminAuditLog,
  AdminAuditLogSchema,
  AdminCategory,
  AdminCategorySchema,
  AdminContent,
  AdminContentSchema,
  AdminCourse,
  AdminCourseSchema,
  AdminReport,
  AdminReportSchema,
  AdminRole,
  AdminRoleSchema,
  AdminSupportTicket,
  AdminSupportTicketSchema,
  AdminUser,
  AdminUserSchema,
  PlatformConfig,
  PlatformConfigSchema,
} from './schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AdminUser.name, schema: AdminUserSchema },
      { name: AdminRole.name, schema: AdminRoleSchema },
      { name: AdminCourse.name, schema: AdminCourseSchema },
      { name: AdminContent.name, schema: AdminContentSchema },
      { name: AdminCategory.name, schema: AdminCategorySchema },
      { name: AdminReport.name, schema: AdminReportSchema },
      { name: PlatformConfig.name, schema: PlatformConfigSchema },
      { name: AdminAuditLog.name, schema: AdminAuditLogSchema },
      { name: AdminSupportTicket.name, schema: AdminSupportTicketSchema },
    ]),
  ],
})
export class AdminModule {}
