import { Schema, Prop, SchemaFactory  } from "@nestjs/mongoose";
import { LearningContentCollection } from "./learning-content-collection";
import { Tag } from "./tag";

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

    @Prop()
    relatedCollection: LearningContentCollection;
} export const LearningContentSchema = SchemaFactory.createForClass(LearningContent)