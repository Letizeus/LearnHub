import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import mongoose from 'mongoose';
import { TagVisibility, TagVisibilityPlace } from 'models';

@Schema()
export class Tag extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  icon?: string;

  @Prop()
  color?: string;

  @Prop()
  backgroundImage?: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'TagGroup' })
  group?: string;
}

export const TagSchema = SchemaFactory.createForClass(Tag);

@Schema()
export class TagGroup extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  icon?: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }], default: [] })
  tags: mongoose.Schema.Types.ObjectId[];

  @Prop({ type: String, enum: ['SEARCH_PAGE', 'TAG_SELECT'] })
  visibility: TagVisibility;
}

export const TagGroupSchema = SchemaFactory.createForClass(TagGroup);
