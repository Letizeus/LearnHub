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

import { ExamHandler } from './exam.handler';

@Component({
  selector: 'app-add-exams',
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
  templateUrl: './add-exams.html',
  styleUrls: ['./add-exams.scss'],
})
export class AddExams {
  private _examHandler: ExamHandler

  protected title: string = "";
  protected files: File[] = [];
  protected previews: string[] = [];
  protected activePreview: string | null = null;

  constructor(examHandler: ExamHandler){
    this._examHandler = examHandler;
  }

  openPreview(img: string){
    this.activePreview = img;
  }

  closePreview(){
    this.activePreview = null;
  }

  removeChosenFile(index: number){
    URL.revokeObjectURL(this.previews[index]);
    this.previews.splice(index, 1);
    this.previews = [...this.previews];
    this.activePreview = null;
  }

  onFileSelect($event: FileSelectEvent){
    this.files = [...$event.files];
    for(const file of this.files){
      const reader = new FileReader();
      reader.onload = () =>{
        this.previews.push(reader.result as string);
      }
      reader.readAsDataURL(file);
    }
  }

  async addExam(fileUpload: FileUpload){
    const newExam = new FormData();
    newExam.append('title', this.title);
    for (const file of this.files){
      newExam.append('files', file);
    }

    try {
      const saved = await firstValueFrom(this._examHandler.addExam(newExam)); //.subscribe({next:, err: ...) is deprecated, so alternative after research.
      console.log(saved);
      this.resetForm(fileUpload);
    } catch (err) {
      console.error('Upload failed', err);
      this.resetForm(fileUpload);
    }
  }

  resetForm(fileUpload: FileUpload){
    fileUpload.clear();
    this.title = "";
    this.files = [];
    this.previews = []; 
    this.activePreview = null;
  }
}




