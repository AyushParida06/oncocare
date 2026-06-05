import { Injectable, signal, computed, OnDestroy } from '@angular/core';
import { ConvexClient } from 'convex/browser';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ConvexService implements OnDestroy {
  private readonly _client: ConvexClient;

  constructor(private authService: AuthService) {
    this._client = new ConvexClient(environment.convexUrl);
    // Share client with auth service so it can attach tokens
    authService.setClient(this._client);
  }

  get client(): ConvexClient {
    return this._client;
  }

  ngOnDestroy(): void {
    this._client.close();
  }
}
