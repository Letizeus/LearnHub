import { Injectable } from "@nestjs/common";
import { Post } from "@nestjs/common";
import { Exam } from "./exam";

@Injectable()
export class ExamService {
    constructor(){

    }   

    @Post('api/addExam')
    public addExam(exam: FormData){
        const newExam: Exam = new Exam();
        const title =  exam.get('title');
        if(typeof title === 'string') {
            newExam.title = title;
        }
        const files: File[] = exam.getAll('files').filter((v): v is File => v instanceof File);
    }
}