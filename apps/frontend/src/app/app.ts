import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AddView } from './add-view/add-view';

@Component({
  imports: [
    RouterModule, 
    AddView
  ],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'frontend';
}
