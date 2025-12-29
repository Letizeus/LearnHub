import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AddExams } from './add-exams/add-exams';

@Component({
  imports: [RouterModule, AddExams],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'frontend';
}
