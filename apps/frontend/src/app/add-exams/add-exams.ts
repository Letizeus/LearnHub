import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { firstValueFrom } from 'rxjs';

import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';
import { FileSelectEvent, FileUpload, FileUploadModule } from 'primeng/fileupload';

import { ExamService } from './exam_service';

@Component({
  selector: 'app-add-exams',
  imports: [FormsModule,InputTextModule, FloatLabelModule, ButtonModule, FileUploadModule],
  templateUrl: './add-exams.html',
  styleUrl: './add-exams.css',
})
export class AddExams {
  private _examService: ExamService

  protected title: string = "";
  protected files: File[] = [];

  constructor(service: ExamService){
    this._examService = service
  }

  onFileSelect($event: FileSelectEvent){
    this.files = [...$event.files];
  }

  async addExam(fileUpload: FileUpload){
    const newExam = new FormData();
    newExam.append('title', this.title);
    for (const file of this.files){
      newExam.append('files', file);
    }

    try {
      const saved = await firstValueFrom(this._examService.addExam(newExam)); //.subscribe({next:, err: ...) is deprecated, so alternative after research.
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
  }
}




