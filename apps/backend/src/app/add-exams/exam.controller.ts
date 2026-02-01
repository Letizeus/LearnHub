/*import { Controller, Post, UseInterceptors, Body, UploadedFiles } from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { ExamService } from "./exam.service";

@Controller('exams')
export class ExamController {

    constructor(private readonly examService: ExamService) {}

    @Post('add')
    @UseInterceptors(
        FilesInterceptor('files', 20)
    )
    public async addExam(
        @Body('title') title: string,
        @UploadedFiles() files: Express.Multer.File[]
    ){
        return this.examService.createExam(title, files);
    }
}
*/