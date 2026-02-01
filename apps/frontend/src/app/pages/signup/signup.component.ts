import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { PasswordModule } from 'primeng/password';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { IftaLabelModule } from 'primeng/iftalabel';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, PasswordModule, FloatLabelModule, InputTextModule, ButtonModule, IftaLabelModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  passwordrep: string = '';

  errorMessage: string | null = null;
  successMessage: string | null = null;
  isSubmitting = false;

  isFormValid(): boolean {
    return (
      this.email.trim() !== '' &&
      this.password.trim() !== '' &&
      this.username.trim() !== '' &&
      this.passwordrep.trim() !== ''
    );
  }

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    this.errorMessage = null;
    this.successMessage = null;

    if (!this.isFormValid()) {
      this.errorMessage = 'Fill out all fields';
      return;
    }

    this.isSubmitting = true;

    this.http
      .post('http://localhost:3000/api/users/signup', {
        username: this.username,
        email: this.email,
        password: this.password,
        passwordrep: this.passwordrep,
      })
      .subscribe({
        next: (res: any) => {
          console.log('User erstellt:', res);
          this.successMessage = 'User signed up successfully. Redirection...';
          this.isSubmitting = false;
          setTimeout(() => this.router.navigate(['/login']), 700);
        },
        error: (err) => {
          console.error(err);
          this.isSubmitting = false;
          this.errorMessage = err?.error?.message || 'Error during signup';
        },
      });
  }
}
