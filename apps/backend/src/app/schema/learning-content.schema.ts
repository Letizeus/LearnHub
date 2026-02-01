import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import mongoose from 'mongoose';
import { Tag } from './tag.schema';
import { LEARNING_CONTENT_COLLECTION_NAME, LEARNING_CONTENT_NAME } from 'models';

@Schema({
  discriminatorKey: 'type',
  timestamps: true,
  collection: LEARNING_CONTENT_NAME, // Shared collection
})
export class LearningContent extends Document {
  @Prop({ required: true })
  type: string;

  @Prop()
  keywords: string;

  @Prop({ default: 0 })
  downloads: number;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: [] })
  likes: mongoose.Schema.Types.ObjectId[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }], default: [] })
  tags: Tag[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: LEARNING_CONTENT_COLLECTION_NAME })
  relatedCollection: any; // Use forwardRef or string name to avoid circular dependency

  @Prop({ type: Object })
  analytics: any;
}

export const LearningContentSchema = SchemaFactory.createForClass(LearningContent);

@Schema()
export class Exercise {
  @Prop({ required: true })
  text: string;

  @Prop([String])
  images?: string[];

  @Prop()
  tip?: string;

  @Prop()
  solution?: string;

  @Prop([String])
  solutionImages?: string[];

  @Prop()
  eval_points?: number;

  @Prop()
  total_points?: number;
}

export const ExerciseSchema = SchemaFactory.createForClass(Exercise);

@Schema({ timestamps: { createdAt: 'createdAt', updatedAt: 'changedAt' }, collection: LEARNING_CONTENT_COLLECTION_NAME })
export class LearningContentCollection extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ type: String, enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'], default: 'DRAFT' })
  status: string;

  @Prop({
    type: {
      url: String,
      publishedAt: Date,
      publisher: String,
      organisation: String,
    },
    _id: false,
  })
  source: {
    url?: string;
    publishedAt?: Date;
    publisher?: string;
    organisation?: string;
  };

  @Prop({ required: true })
  author: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: LEARNING_CONTENT_NAME }] })
  contents: LearningContent[];
}

export const LearningContentCollectionSchema = SchemaFactory.createForClass(LearningContentCollection);
