import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar.component';
import { ToastModule } from 'primeng/toast';

@Component({
  imports: [RouterModule, NavbarComponent, ToastModule],
  selector: 'lh-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class AppComponent {
  protected title = 'frontend';
}
