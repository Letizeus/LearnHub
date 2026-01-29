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

  @Prop({ required: true, select: false })
  password!: string;

  @Prop({ default: 'active' })
  status!: string;

  @Prop()
  lastActiveAt?: Date;

  createdAt!: Date;
  updatedAt!: Date;
}
export const AdminUserSchema = SchemaFactory.createForClass(AdminUser);

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
export class PlatformConfig extends Document {
  @Prop({ type: Object, default: {} })
  featureFlags!: Record<string, boolean>;

  @Prop({ type: Object, default: {} })
  limits?: Record<string, number>;
}
export const PlatformConfigSchema =
  SchemaFactory.createForClass(PlatformConfig);
