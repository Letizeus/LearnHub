import { Schema, Prop, SchemaFactory  } from "@nestjs/mongoose";
import { Tag } from "./tag";
import { Types } from "mongoose";
import { Exercise } from "./exercise";

@Schema()
export class LearningContent{
    //automatisch id: string;
    @Prop()
    type: string;

    @Prop()
    keywords: string;

    @Prop()
    downloads: number;

    @Prop()
    likes: number;

    @Prop()
    tags: Tag[];

    @Prop({ type: [{ type: Types.ObjectId, ref: Exercise }], default: [] })
    relatedCollection: Types.ObjectId;
} export const LearningContentSchema = SchemaFactory.createForClass(LearningContent)