import { Controller, Post, UseInterceptors, Body, UploadedFiles } from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { ExamService } from "./exam.service";
import { diskStorage } from "multer";

@Controller('exams')
export class ExamController {

    constructor(private readonly examService: ExamService) {}

    @Post('add')
    @UseInterceptors(
        FilesInterceptor('files', 20, {
            storage: diskStorage({
                destination: './uploads', //Destination OnDevice, prefering a file system when scaling and in production.
                filename: (req, file, cb) => {
                    cb(null, ''+Date.now().toString()+"_"+file.originalname);
                }
            })
        })
    )
    public async addExam(
        @Body('title') title: string,
        @UploadedFiles() files: Express.Multer.File[]
    ){
        return this.examService.createExam(title, files);
    }
}