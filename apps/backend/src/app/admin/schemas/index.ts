// TEMP: Placeholder schemas for demo. Will be replaced with the actual schemas
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class AdminUser extends Document {
  @Prop({ required: true, unique: true })
  username!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true })
  displayName!: string;

  @Prop({ type: [String], default: [] })
  roles!: string[];

  @Prop({ default: 'active' })
  status!: string;
}
export const AdminUserSchema = SchemaFactory.createForClass(AdminUser);

@Schema({ timestamps: true })
export class AdminRole extends Document {
  @Prop({ required: true, unique: true })
  key!: string;

  @Prop({ required: true })
  name!: string;

  @Prop()
  description?: string;

  @Prop({ type: [String], default: [] })
  permissions!: string[];
}
export const AdminRoleSchema = SchemaFactory.createForClass(AdminRole);

@Schema({ timestamps: true })
export class AdminCourse extends Document {
  @Prop({ required: true })
  title!: string;

  @Prop()
  categoryId?: string;

  @Prop({ default: 'active' })
  status!: string;
}
export const AdminCourseSchema = SchemaFactory.createForClass(AdminCourse);

@Schema({ timestamps: true })
export class AdminContent extends Document {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  ownerId!: string;

  @Prop()
  courseId?: string;

  @Prop()
  type?: string;

  @Prop({ default: 'active' })
  status!: string;
}
export const AdminContentSchema = SchemaFactory.createForClass(AdminContent);

@Schema({ timestamps: true })
export class AdminCategory extends Document {
  @Prop({ required: true })
  name!: string;

  @Prop({ default: false })
  disabled!: boolean;
}
export const AdminCategorySchema = SchemaFactory.createForClass(AdminCategory);

@Schema({ timestamps: true })
export class AdminReport extends Document {
  @Prop({ required: true })
  contentId!: string;

  @Prop({ required: true })
  reporterId!: string;

  @Prop()
  reason?: string;

  @Prop({ default: 'open' })
  status!: string;
}
export const AdminReportSchema = SchemaFactory.createForClass(AdminReport);

@Schema({ timestamps: true })
export class PlatformConfig extends Document {
  @Prop({ type: Object, default: {} })
  featureFlags!: Record<string, boolean>;

  @Prop({ type: Object, default: {} })
  limits?: Record<string, number>;
}
export const PlatformConfigSchema =
  SchemaFactory.createForClass(PlatformConfig);

@Schema({ timestamps: true })
export class AdminAuditLog extends Document {
  @Prop({ required: true })
  actorId!: string;

  @Prop({ required: true })
  action!: string;

  @Prop({ required: true })
  resource!: string;

  @Prop({ type: Object })
  payload?: Record<string, unknown>;
}
export const AdminAuditLogSchema = SchemaFactory.createForClass(AdminAuditLog);

@Schema({ timestamps: true })
export class AdminSupportTicket extends Document {
  @Prop({ required: true })
  subject!: string;

  @Prop({ default: 'open' })
  status!: string;
}
export const AdminSupportTicketSchema =
  SchemaFactory.createForClass(AdminSupportTicket);
