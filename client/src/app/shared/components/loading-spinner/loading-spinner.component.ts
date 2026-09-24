import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="text-center py-5" *ngIf="show">
      <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 text-muted fw-semibold">{{ message }}</p>
    </div>
  `
})
export class LoadingSpinnerComponent {
  @Input() show: boolean = true;
  @Input() message: string = 'Loading scientific data...';
}
