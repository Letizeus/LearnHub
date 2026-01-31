import { Schema, SchemaFactory, Prop } from "@nestjs/mongoose";
import { LearningContent } from "./learning-content";


@Schema()
export class LearningContentCollection{
    //automatisch: id: string;
    @Prop()
    title: string; 
    
    @Prop()
    status: Status;

    @Prop()
    source: Source;

    @Prop()
    author: string;

    @Prop()
    createdAt: Date;

    @Prop()
    changedAt: Date;

    @Prop()
    contents: LearningContent;
} export const LearningContentCollectionSchema = SchemaFactory.createForClass(LearningContentCollection);

enum Status {
    DRAFT, PUBLISHED, ARCHIVED
}

interface Source {
    url: string;
    publishedAt: Date;
    publisher: string;
    organisation: string;
}