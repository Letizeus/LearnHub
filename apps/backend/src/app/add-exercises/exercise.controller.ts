/*import { Controller, Post, UseInterceptors, Body, UploadedFiles } from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { ExerciseService } from "./exercise.service";


@Controller('exercises')
export class ExerciseController {

    constructor(private readonly exerciseService: ExerciseService) {}

    @Post('add')
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'exerciseImages', maxCount: 20},
            { name: 'solutionImages', maxCount: 20},
        ])
    )
    public async addExam(
        @Body('text') text: string,
        @Body('solution') solution: string,
        @Body('totalPoints') totalPoints: string,
        @UploadedFiles() images: {
            exerciseImages?: Express.Multer.File[]
            solutionImages?: Express.Multer.File[]
        } ,
    ){
        return this.exerciseService.create(text, solution, totalPoints, images.exerciseImages ?? [], images.solutionImages ?? []);
    }
}
    */