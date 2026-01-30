import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose"

@Schema()
export class Exercise {
    @Prop({ required: true })
    exercise: string;
    
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