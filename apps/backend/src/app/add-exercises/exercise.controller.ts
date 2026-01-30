import { Controller, Post, UseInterceptors, Body, UploadedFiles } from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { ExerciseService } from "./exercise.service";


@Controller('exercises')
export class ExamController {

    constructor(private readonly exerciseService: ExerciseService) {}

    @Post('add')
    @UseInterceptors(
        FilesInterceptor('files', 20)
    )
    public async addExam(
        @Body('exercise') exercise: string,
        @Body('solution') solution: string,
        @Body('totalPoints') totalPoints: string,
        @UploadedFiles() exerciseImages: Express.Multer.File[],
        @UploadedFiles() solutionImages: Express.Multer.File[]
    ){
        return this.exerciseService.create(exercise, solution, totalPoints, exerciseImages, solutionImages);
    }
}