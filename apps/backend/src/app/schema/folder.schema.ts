import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Document } from 'mongoose';

@Schema()
export class Folder extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: mongoose.Types.ObjectId;

  @Prop({ default: false })
  isLiked: boolean;

  @Prop({ required: true })
  name: string;

  @Prop()
  icon?: string;

  @Prop()
  color?: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LearningContent' }], default: [] })
  content: string[];
}

export const FolderSchema = SchemaFactory.createForClass(Folder);
