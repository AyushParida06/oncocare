import { Component, OnInit } from '@angular/core';
import { JourneyService } from '../../services/journey.service';

interface JourneyStep {
  title: string;
  description?: string;
  order: number;
  completedAt?: string;
}

@Component({
  selector: 'app-treatment-journey',
  templateUrl: './treatment-journey.component.html',
  styleUrls: ['./treatment-journey.component.css']
})
export class TreatmentJourneyComponent implements OnInit {
  steps: JourneyStep[] = [];
  loading = true;
  isClinician = false;

  constructor(private journeyService: JourneyService) {}

  async ngOnInit() {
    // Determine role from auth (the service can expose)
    this.isClinician = await this.journeyService.isClinician();
    this.steps = await this.journeyService.getSteps();
    this.loading = false;
  }

  async addStep() {
    const title = prompt('Step title');
    if (!title) return;
    const descriptionInput = prompt('Description (optional)');
    const description = descriptionInput ?? undefined;
    const order = this.steps.length ? Math.max(...this.steps.map(s => s.order)) + 1 : 1;
    await this.journeyService.addStep({ title, description, order });
    this.steps = await this.journeyService.getSteps();
  }

  async complete(step: JourneyStep) {
    await this.journeyService.completeStep(step.order);
    this.steps = await this.journeyService.getSteps();
  }
}
