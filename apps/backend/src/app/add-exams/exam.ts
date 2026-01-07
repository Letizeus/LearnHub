import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Exam {
    @Prop({ required: true })
    title: string;

    @Prop({
        type: [
            {
                filename: String,
                mimetype: String,
                size: Number,
                path: String,
            },
        ],
    })
    files: {
        filename: string;
        mimetype: string; 
        size: number;
        path: string;
    }[];
}
export const ExamSchema = SchemaFactory.createForClass(Exam);