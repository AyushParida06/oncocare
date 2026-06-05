import { Injectable, signal, computed } from '@angular/core';
import { ConvexClient } from 'convex/browser';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'vistaonco_auth_token';

  /** Public reactive signals */
  readonly isAuthenticated = signal<boolean>(this._loadToken() !== null);
  readonly isLoading = signal<boolean>(false);

  private _client: ConvexClient | null = null;

  constructor() {
    // Re-hydrate auth state from localStorage on startup
    const token = this._loadToken();
    if (token) {
      this.isAuthenticated.set(true);
    }
  }

  /** Called by ConvexService to share the client instance */
  setClient(client: ConvexClient): void {
    this._client = client;
    const token = this._loadToken();
    if (token && client) {
      client.setAuth(async () => token, () => {
        this.isAuthenticated.set(false);
        this._clearToken();
      });
    }
  }

  async signIn(email: string, password: string, flow: 'signIn' | 'signUp'): Promise<void> {
    this.isLoading.set(true);
    try {
      if (!this._client) {
        throw new Error('Convex client not initialized');
      }
      
      const { api } = await import('../../convex/_generated/api');
      
      const data: any = await this._client.action(api.auth.signIn, { 
        provider: 'password', 
        params: { email, password, flow } 
      });

      this._handleAuthSuccess(data);
    } finally {
      this.isLoading.set(false);
    }
  }

  private _handleAuthSuccess(data: any): void {
    // @convex-dev/auth returns token in different shapes depending on version
    const token = data?.token ?? data?.access_token ?? data?.sessionToken ?? null;
    if (token) {
      this._saveToken(token);
      if (this._client) {
        this._client.setAuth(async () => token, () => {
          this.isAuthenticated.set(false);
          this._clearToken();
        });
      }
    }
    // Even without explicit token (cookie-based auth), mark as authenticated
    this.isAuthenticated.set(true);
  }

  async signOut(): Promise<void> {
    try {
      if (!this._client) return;
      const { api } = await import('../../convex/_generated/api');
      await this._client.action(api.auth.signOut, {}).catch(() => {});
    } finally {
      this._clearToken();
      this.isAuthenticated.set(false);
      if (this._client) {
        this._client.setAuth(async () => null, () => {});
      }
    }
  }

  private _loadToken(): string | null {
    try { return localStorage.getItem(this.TOKEN_KEY); } catch { return null; }
  }

  private _saveToken(token: string): void {
    try { localStorage.setItem(this.TOKEN_KEY, token); } catch {}
  }

  private _clearToken(): void {
    try { localStorage.removeItem(this.TOKEN_KEY); } catch {}
  }

  /** Friendly error messages matching the React version */
  friendlyError(msg: string = ''): string {
    if (msg.includes('Invalid password') || msg.includes('invalid password'))
      return 'Incorrect password. Please try again.';
    if (msg.includes('already exists') || msg.includes('already registered'))
      return 'An account with this email already exists. Please sign in instead.';
    if (msg.includes('not found') || msg.includes('no account'))
      return 'No account found with this email. Please sign up first.';
    if (msg.includes('Invalid email') || msg.includes('invalid email'))
      return 'Please enter a valid email address.';
    return msg || 'Authentication failed. Please try again.';
  }
}
