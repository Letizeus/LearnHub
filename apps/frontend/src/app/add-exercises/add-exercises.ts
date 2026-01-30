import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';

import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TextareaModule } from 'primeng/textarea';
import { IftaLabelModule } from 'primeng/iftalabel';
import { FileSelectEvent, FileUpload, FileUploadModule } from 'primeng/fileupload';

import {ExerciseHandler} from './exercise.handler';

@Component({
    selector: 'app-add-exercises',
     imports: [ScrollPanelModule, 
    CommonModule,
    IftaLabelModule,
    TextareaModule,
    InputNumberModule,
    FormsModule,
    InputTextModule,
    FloatLabelModule, 
    ButtonModule, 
    FileUploadModule],
    templateUrl: './add-exercises.html',
    styleUrls: ['./add-exercises.scss']
})
export class AddExercises {
    private _exerciseHandler: ExerciseHandler

    protected exercise: string = "";
    protected exercisePreviews: string[] = [];
    protected exerciseFiles: File[] = [];
    protected solution: string = "";
    protected solutionPreviews: string[] = [];
    protected solutionFiles: File[] = [];
    protected totalPoints: number = 0;
    protected activePreview: string | null = null;

    constructor(exerciseHandler: ExerciseHandler){
        this._exerciseHandler = exerciseHandler
    }

    openPreview(img: string){
        this.activePreview = img;
    }

    closePreview(){
        this.activePreview = null;
    }

    removeChosenExercise(index: number){
        URL.revokeObjectURL(this.exercisePreviews[index]);
        this.exercisePreviews.splice(index, 1); 
        this.exercisePreviews = [... this.exercisePreviews];
        this.activePreview = null;
    }

    removeChosenSolution(index: number){
        URL.revokeObjectURL(this.solutionPreviews[index]);
        this.solutionPreviews.splice(index, 1);
        this.solutionPreviews = [... this.solutionPreviews];
        this.activePreview = null;
    } 

    onExerciseSelect($event: FileSelectEvent){
        this.exerciseFiles = [...$event.files];
        for(const file of this.exerciseFiles){
            const reader = new FileReader();
            reader.onload = () => {
                this.exercisePreviews.push(reader.result as string);
            }
            reader.readAsDataURL(file)
        }
    }

    onSolutionSelect($event: FileSelectEvent){
        this.solutionFiles = [... $event.files];
        for(const file of this.solutionFiles){
            const reader = new FileReader();
            reader.onload = () => {
                this.solutionPreviews.push(reader.result as string);
            }
            reader.readAsDataURL(file);
        }
    }

    async addExercise(fileUpload: FileUpload){
        const newExercise = new FormData();
        newExercise.append("text", this.exercise);
        for(const file of this.exerciseFiles){
            newExercise.append("images", file);
        }

        newExercise.append("solution", this.solution);
        for(const file of this.solutionFiles){
            newExercise.append("solutionImages", file);
        }

        newExercise.append("total_points", ""+this.totalPoints);
        
        try {
            const saved = await firstValueFrom(this._exerciseHandler.addExercise(newExercise));
            console.log(saved);
            this.resetForm(fileUpload);
        } catch (err) {
            console.error('Upload failed', err);
            this.resetForm(fileUpload);
        }
    }

    resetForm(fileUpload: FileUpload){
        fileUpload.clear();
        this.exercise = "";
        this.exerciseFiles, this.exercisePreviews = [];
        this.solution = "";
        this.solutionFiles, this.solutionPreviews = [];
        this.totalPoints = 0;
        this.activePreview = null;
    }
}