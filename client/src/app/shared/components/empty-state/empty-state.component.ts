import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="text-center py-5 px-3">
      <div class="mb-3 text-muted">
        <i [class]="'bi ' + icon" style="font-size: 3.5rem; opacity: 0.5;"></i>
      </div>
      <h5 class="fw-bold text-dark mb-2">{{ title }}</h5>
      <p class="text-muted mb-4 mx-auto" style="max-width: 480px;">{{ description }}</p>
      <div *ngIf="actionText">
        <a *ngIf="actionLink" [routerLink]="actionLink" class="btn btn-briti-primary">
          <i class="bi bi-arrow-right me-1"></i> {{ actionText }}
        </a>
        <button *ngIf="!actionLink" (click)="actionClick.emit()" class="btn btn-briti-primary">
          {{ actionText }}
        </button>
      </div>
    </div>
  `
})
export class EmptyStateComponent {
  @Input() title: string = 'No records found';
  @Input() description: string = 'There are no items to display matching your criteria.';
  @Input() icon: string = 'bi-inbox';
  @Input() actionText?: string;
  @Input() actionLink?: string;
  @Output() actionClick = new EventEmitter<void>();
}
