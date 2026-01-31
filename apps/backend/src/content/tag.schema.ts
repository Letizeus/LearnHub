import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TagVisibility } from '@learnhub/models';

@Schema()
export class Tag {
  _id?: any;

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

  @Prop({ required: true })
  icon: string;

  @Prop({ type: [TagSchema], default: [] })
  tags: Tag[];

  @Prop({
    type: String,
    enum: Object.values(TagVisibility),
    default: TagVisibility.SEARCH_PAGE,
  })
  visibility: TagVisibility;
}

export const TagGroupSchema = SchemaFactory.createForClass(TagGroup);
