import { Schema, SchemaFactory, Prop } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

@Schema()
export class LearningContentCollection{
    //automatisch: id: string;
    @Prop()
    title: string; 
    
    @Prop()
    status: Status;

//    @Prop()
//    source: Source;

    @Prop()
    author: string;

    @Prop()
    createdAt: Date;

    @Prop()
    changedAt: Date;

    @Prop()
    contents: Types.ObjectId[];
}
export type LearningContentCollectionDocument = HydratedDocument<LearningContentCollection> 
export const LearningContentCollectionSchema = SchemaFactory.createForClass(LearningContentCollection);

enum Status {
    DRAFT, PUBLISHED, ARCHIVED
}