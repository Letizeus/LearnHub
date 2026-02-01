import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';


import { PasswordModule } from 'primeng/password';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, PasswordModule, FloatLabelModule, InputTextModule, ButtonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  errorMessage: string | null = null;
  isSubmitting = false;

  isFormValid(): boolean {
    return this.email.trim() !== '' && this.password.trim() !== '';
  }

  constructor(private http: HttpClient, private router: Router, private auth: AuthService) {}

  onSubmit() {
    this.errorMessage = null;

    if (!this.isFormValid()) {
      this.errorMessage = 'Fill out all fields';
      return;
    }

    this.isSubmitting = true;

    this.http
      .post('http://localhost:3000/api/auth/login', { email: this.email, password: this.password })
      .subscribe({
        next: (res: any) => {
          const token = res?.access_token;
          if (token) {
            this.auth.setToken(token);
            this.router.navigate(['']);
          } else {
            this.errorMessage = 'Error from server';
          }
          this.isSubmitting = false;
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err?.error?.message || 'Error during login';
        },
      });
  }
}
