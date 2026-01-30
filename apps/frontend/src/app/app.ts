import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AddExams } from './add-exams/add-exams';
import { AddExercises } from './add-exercises/add-exercises';

@Component({
  imports: [
    RouterModule, 
    AddExercises,
    AddExams
  ],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'frontend';
}
