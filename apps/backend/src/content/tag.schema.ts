import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import mongoose from 'mongoose';

@Schema()
export class Tag extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  icon?: string;

  @Prop()
  color?: string;

  @Prop()
  backgroundImage?: string;
}

export const TagSchema = SchemaFactory.createForClass(Tag);

@Schema()
export class TagGroup extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  icon?: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }] })
  tags: Tag[];

  @Prop({ type: [String], enum: ['SEARCH_PAGE', 'TAG_SELECT'] })
  visibility: string[];
}

export const TagGroupSchema = SchemaFactory.createForClass(TagGroup);
