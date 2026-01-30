import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})
export class ExerciseHandler {
    constructor(private http: HttpClient){}
    public addExercise(newExercise: FormData){
        const baseUrl: string = "http://localhost:3000/api";
        newExercise.forEach((value, key) => {
            console.log(key, value);
            if (value instanceof File) {
                console.log('  name:', value.name);
                console.log('  type:', value.type);
                console.log('  size:', value.size);
            }
        });
        return this.http.post(baseUrl+'exercises/add', newExercise);
    }
}