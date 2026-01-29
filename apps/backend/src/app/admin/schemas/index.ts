import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
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
export const UserSchema = SchemaFactory.createForClass(User);

@Schema({ _id: false })
export class TagSchema {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  icon!: string;

  @Prop({ required: true })
  color!: string;

  @Prop({ required: true })
  backgroundImage!: string;
}

@Schema({ collection: 'courses', timestamps: { createdAt: 'createdAt', updatedAt: 'changedAt' } })
export class Course extends Document {
  @Prop({ required: true })
  title!: string;

  @Prop({
    required: true,
    enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
    default: 'DRAFT',
  })
  status!: string;

  @Prop({ type: Object })
  source?: {
    url?: string;
    publishedAt?: Date;
    publisher?: string;
    organisation?: string;
  };

  @Prop()
  author?: string;

  @Prop({ type: [String], default: [] })
  contentIds!: string[];

  createdAt!: Date;
  changedAt!: Date;
}
export const CourseSchema = SchemaFactory.createForClass(Course);

@Schema({ collection: 'contents', timestamps: { createdAt: 'createdAt', updatedAt: 'changedAt' } })
export class Content extends Document {
  @Prop({ required: true })
  type!: string;

  @Prop()
  keywords?: string;

  @Prop({ default: 0 })
  downloads!: number;

  @Prop({ default: 0 })
  likes!: number;

  @Prop({ type: [TagSchema], default: [] })
  tags!: TagSchema[];

  @Prop()
  relatedCollectionId?: string;

  @Prop()
  text?: string;

  @Prop({ type: [String], default: [] })
  images?: string[];

  @Prop()
  tip?: string;

  @Prop()
  solution?: string;

  @Prop({ type: [String], default: [] })
  solutionImages?: string[];

  @Prop()
  eval_points?: number;

  @Prop()
  total_points?: number;

  createdAt!: Date;
  changedAt!: Date;
}
export const ContentSchema = SchemaFactory.createForClass(Content);

@Schema({ collection: 'categories', timestamps: true })
export class Category extends Document {
  @Prop({ required: true })
  name!: string;

  @Prop({ default: false })
  disabled!: boolean;
}
export const CategorySchema = SchemaFactory.createForClass(Category);

@Schema({ timestamps: true })
export class PlatformConfig extends Document {
  @Prop({ type: Object, default: {} })
  featureFlags!: Record<string, boolean>;

  @Prop({ type: Object, default: {} })
  limits?: Record<string, number>;
}
export const PlatformConfigSchema =
  SchemaFactory.createForClass(PlatformConfig);
