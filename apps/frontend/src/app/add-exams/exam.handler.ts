import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable(
{
    providedIn: 'root'
}
)
export class ExamHandler {
    constructor(private http: HttpClient) {}
    public addExam(newExam: FormData){
        const baseUrl: string = "http://localhost:3000/api/";
        //CONSOLE LOGGING
        newExam.forEach((value, key) => {
            console.log(key, value);

            if (value instanceof File) {
                console.log('  name:', value.name);
                console.log('  type:', value.type);
                console.log('  size:', value.size);
            }
        });
        return this.http.post(baseUrl+'exams/add', newExam);
    }
}