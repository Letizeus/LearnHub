import { Component } from "@angular/core";
import { FormsModule } from '@angular/forms';
import { CommonModule } from "@angular/common";
import { HttpClient } from "@angular/common/http";

import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TextareaModule } from 'primeng/textarea';
import { IftaLabelModule } from 'primeng/iftalabel';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { FileSelectEvent, FileUpload } from "primeng/fileupload";

@Component({
    selector: 'app-add-view',
    templateUrl: './add-view.html',
    styleUrls: ['./add-view.scss'],
    imports: [
        FormsModule,
        CommonModule,
        ScrollPanelModule,
        FloatLabelModule,
        InputTextModule,
        ButtonModule,
        InputNumberModule,
        TextareaModule,
        IftaLabelModule,
        DialogModule,
        TableModule,
        FileUpload
    ],
}) export class AddView {
    constructor(private http: HttpClient){}

    protected activePreview: string | null = null;

    protected dialogVisible: boolean = false;
    protected dialogMode: "create" | "edit" = "create";
    protected editIndex: number | null = null;

    //LearningContentCollectionForm
    protected title: string = "";
    protected author: string = "";
    protected learningContents: LearningContentForm[] = [];
    
    protected lcForm: LearningContentForm = new LearningContentForm()
    
    openDialogCreate(){
        this.dialogMode = "create"; 
        this.editIndex = null;
        this.lcForm = new LearningContentForm();
        this.dialogVisible = true;
    }

    openDialogEdit(lc: LearningContentForm, index: number){
        this.dialogMode = "edit";
        this.editIndex = index;
        this.lcForm = structuredClone(lc);
        this.dialogVisible = true;
    }

    saveDialog(){
        if(this.lcForm.exercise.text.length < 10){
            return;
        }
        if(this.dialogMode == "create"){
            this.learningContents = [... this.learningContents, this.lcForm];
        } else if (this.editIndex !== null) {
            const copy = [...this.learningContents];
            copy[this.editIndex] = this.lcForm;
            this.learningContents = copy;
        }
        this.dialogVisible = false;
    }


    openPreview(img: string){
        this.activePreview = img;
    }

    closePreview(){
        this.activePreview = null;
    }


    removeFromCollection(index: number){
        this.learningContents.splice(index, 1); 
        this.learningContents = [... this.learningContents];
    }

    upload(){
        if(this.title.length == 0 || this.author.length == 0){
            return;
        }
        
        const fd = new FormData();
        fd.append('title', this.title);
        fd.append('author', this.author);
        const payload = this.learningContents.map(lc => ({
            type: lc.type,
            keywords: lc.keywords,
            exercise: {
                text: lc.exercise.text,
                tip: lc.exercise.tip,
                solution: lc.exercise.solution,
                total_points: lc.exercise.total_points
            }
        }))

        fd.append('learningContents', JSON.stringify(payload));
        this.learningContents.forEach((lc, i) => {
            lc.exercise.images.forEach((file, j) => {
            fd.append(`exerciseImages[${i}][]`, file);
            });

            lc.exercise.solutionImages.forEach((file, j) => {
            fd.append(`solutionImages[${i}][]`, file);
            });
        });
        this.http.post('http://localhost:3000/api/learning-content-collection/add', fd).subscribe({
            next: (res) => console.log('ok', res),
            error: (err) => console.error(err),
        });
        fd.forEach((value, key) => {
            console.log(key, value);
            if (value instanceof File) {
                console.log('  name:', value.name);
                console.log('  type:', value.type);
                console.log('  size:', value.size);
            }
        });
    }  
}

export class LearningContentForm {
    type: string = "";
    keywords: string = "";
    //tags
    exercise: ExerciseForm = new ExerciseForm();
}

export class ExerciseForm {
    text: string = "";
    images: File[] = [];
    imagesPreviews: string[] = [];
    tip: string = "";
    solution: string = "";
    solutionImages: File[] = [];
    solutionImagesPreviews: string[] = [];
    total_points: number = 0;

    onExerciseSelect($event: FileSelectEvent){
        this.images = [...$event.files];
        for(const file of this.images){
            const reader = new FileReader();
            reader.onload = () => {
                this.imagesPreviews.push(reader.result as string);
            }
            reader.readAsDataURL(file)
        }
    }

    onSolutionSelect($event: FileSelectEvent){
        this.solutionImages = [... $event.files];
        for(const file of this.solutionImages){
            const reader = new FileReader();
            reader.onload = () => {
                this.solutionImagesPreviews.push(reader.result as string);
            }
            reader.readAsDataURL(file);
        }
    }

    removeChosenExercise(index: number){
        URL.revokeObjectURL(this.imagesPreviews[index]);
        this.imagesPreviews.splice(index, 1); 
        this.imagesPreviews = [... this.imagesPreviews];
    }

    removeChosenSolution(index: number){
        URL.revokeObjectURL(this.solutionImagesPreviews[index]);
        this.solutionImagesPreviews.splice(index, 1);
        this.solutionImagesPreviews = [... this.solutionImagesPreviews];
    } 
}