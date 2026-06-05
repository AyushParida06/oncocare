import { Injectable, signal, computed } from '@angular/core';

export type Theme = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'vistaonco_theme';

  readonly theme = signal<Theme>(this._load());
  readonly isDark = computed(() => this.theme() === 'dark');

  private _load(): Theme {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  }

  toggleTheme(): void {
    const next: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        this.theme.set(next);
        try { localStorage.setItem(this.STORAGE_KEY, next); } catch {}
      });
    } else {
      this.theme.set(next);
      try { localStorage.setItem(this.STORAGE_KEY, next); } catch {}
    }
  }

  setTheme(t: Theme): void {
    this.theme.set(t);
    try { localStorage.setItem(this.STORAGE_KEY, t); } catch {}
  }
}
