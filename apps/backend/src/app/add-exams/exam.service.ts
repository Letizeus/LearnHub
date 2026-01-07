import {Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";

import { Exam } from "./exam";

@Injectable()
export class ExamService {
    constructor(@InjectModel(Exam.name) private examModel: Model<Exam>){}   
    async createExam(
        title: string,
        files: Express.Multer.File[]){
        return await this.examModel.create(
            {
                title: title,
                files: files.map(f => ({
                    filename: f.filename,
                    mimetype: f.mimetype,
                    size: f.size,
                    path: f.path,
                })),
            }
        )
    }
}