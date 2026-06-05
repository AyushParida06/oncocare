import { Injectable, inject } from '@angular/core';
import { ConvexClient } from 'convex/browser';
import { ConvexService } from '../services/convex.service';

/**
 * Base class for page components needing Convex subscriptions.
 * Usage: extend this class, call this.subscribe() in ngOnInit.
 */
@Injectable()
export abstract class ConvexPageBase {
  protected readonly convexSvc = inject(ConvexService);
  protected get client(): ConvexClient { return this.convexSvc.client; }

  private _unsubs: (() => void)[] = [];

  protected sub<T>(query: any, args: any, onUpdate: (v: T) => void): void {
    this._unsubs.push(this.client.onUpdate(query, args, onUpdate));
  }

  protected async mutate(mutation: any, args: any): Promise<any> {
    return this.client.mutation(mutation, args);
  }

  protected cleanup(): void {
    this._unsubs.forEach(u => u());
    this._unsubs = [];
  }
}
