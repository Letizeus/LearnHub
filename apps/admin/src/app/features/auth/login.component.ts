// TEMP: Fake dev auth for demo. Replace with real authentication backend.
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionService } from '../../core/services/session.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.session.set({
      token: 'dev-token',
      user: {
        id: 'dev-admin',
        username: 'admin',
        email: this.form.value.email ?? '',
        displayName: 'Admin',
        roles: ['admin'],
      },
    });
    this.router.navigateByUrl('/dashboard');
  }
}
