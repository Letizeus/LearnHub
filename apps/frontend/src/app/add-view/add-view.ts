import { Component } from "@angular/core";
import { FormsModule } from '@angular/forms';
import { CommonModule } from "@angular/common";

import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TextareaModule } from 'primeng/textarea';
import { IftaLabelModule } from 'primeng/iftalabel';
import { PopoverModule } from 'primeng/popover';
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
        PopoverModule,
        TableModule,
        FileUpload
    ],
}) export class AddView {
    protected activePreview: string | null = null;

    //LearningContentCollectionForm
    protected title: string = "";
    protected learningContents: LearningContentForm[] = [];
    protected lc: LearningContentForm = new LearningContentForm()
    
    openPreview(img: string){
        this.activePreview = img;
    }

    closePreview(){
        this.activePreview = null;
    }

    addToCollection(){
        this.learningContents.push(this.lc);
        this.lc = new LearningContentForm();
    }

    removeFromCollection(index: number){
        this.learningContents.splice(index, 1); 
        this.learningContents = [... this.learningContents];
    }

    upload(){

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