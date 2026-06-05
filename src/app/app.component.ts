import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConvexService } from './services/convex.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  styles: [`
    :host { display: block; height: 100vh; }
  `]
})
export class AppComponent {
  // Force initialization of Convex client at app startup
  private readonly convex = inject(ConvexService);
}
