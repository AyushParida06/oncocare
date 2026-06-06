import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  readonly themeService = inject(ThemeService);
  readonly authService = inject(AuthService);
  readonly router = inject(Router);

  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  loading = signal(false);
  isSignUp = signal(false);
  errorMsg = signal('');
  isSuccessTransition = signal(false);
  
  // For the interactive magic grid
  gridCells = new Array(1500).fill(0);

  get isDark() { return this.themeService.isDark(); }

  toggleTheme() { this.themeService.toggleTheme(); }

  async handleLogin() {
    this.errorMsg.set('');
    if (this.password().length < 8) { this.errorMsg.set('Password must be at least 8 characters long.'); return; }
    if (this.isSignUp() && this.password() !== this.confirmPassword()) { this.errorMsg.set('Passwords do not match.'); return; }
    this.loading.set(true);
    try {
      await this.authService.signIn(this.email(), this.password(), this.isSignUp() ? 'signUp' : 'signIn');
      this.isSuccessTransition.set(true);
      setTimeout(() => {
        if (document.startViewTransition) {
          document.startViewTransition(() => {
            this.router.navigate(['/dashboard']);
          });
        } else {
          this.router.navigate(['/dashboard']);
        }
      }, 2500); // Increased delay so user can interact with the grid
    } catch (e: any) {
      this.errorMsg.set(this.authService.friendlyError(e?.message));
    } finally {
      this.loading.set(false);
    }
  }

  toggleMode() {
    this.isSignUp.set(!this.isSignUp());
    this.confirmPassword.set('');
    this.errorMsg.set('');
  }

  passwordMismatch() {
    return this.isSignUp() && this.confirmPassword() && this.password() !== this.confirmPassword();
  }
}
