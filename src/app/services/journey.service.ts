import { Injectable } from '@angular/core';
import { ConvexClient } from 'convex/browser';
import * as api from '../../convex/_generated/api';


@Injectable({ providedIn: 'root' })
export class JourneyService {
  private client = new ConvexClient((window as any).env?.CONVEX_URL || '');

  async isClinician(): Promise<boolean> {
    // Backend enforces role; assume clinician for UI simplicity
    return true;
  }

  async getSteps(): Promise<any[]> {
    return await (this.client as any).query((api as any).journey.getJourneySteps, {});
  }

  async addStep(step: { title: string; description?: string; order: number }): Promise<void> {
    await (this.client as any).mutation((api as any).journey.addJourneyStep, { step });
  }

  async completeStep(order: number): Promise<void> {
    await (this.client as any).mutation((api as any).journey.completeJourneyStep, { stepOrder: order });
  }
}
