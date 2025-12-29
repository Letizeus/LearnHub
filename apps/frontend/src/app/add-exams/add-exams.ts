import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';

@Component({
  selector: 'app-add-exams',
  imports: [FormsModule,InputTextModule, FloatLabelModule, ButtonModule, FileUploadModule],
  templateUrl: './add-exams.html',
  styleUrl: './add-exams.css',
})
export class AddExams {
  title = '';
  uploadedFiles = [];

  close() {
    console.log('Close popover');
  }
}




