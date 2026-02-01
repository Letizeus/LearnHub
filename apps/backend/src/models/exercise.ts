import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose"
import { LearningContent } from "./learning-content";
@Schema()
export class Exercise extends LearningContent {
    @Prop({ required: true })
    text: string;

    @Prop()
    tip: string;
    
    @Prop()
    solution: string;

    @Prop()
    totalPoints: string;

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
    exerciseImages: {
        filename: string;
        mimetype: string;
        size: number;
        path: string
    }[];

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
    solutionImages: {
        filename: string;
        mimetype: string;
        size: number;
        path: string
    }[];
} export const ExerciseSchema = SchemaFactory.createForClass(Exercise);