import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 2000;">
      <div
        *ngFor="let toast of toastService.toasts | async"
        class="toast show align-items-center text-white border-0 mb-2 shadow-lg"
        [ngClass]="{
          'bg-success': toast.type === 'success',
          'bg-danger': toast.type === 'danger',
          'bg-warning text-dark': toast.type === 'warning',
          'bg-primary': toast.type === 'info'
        }"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div class="d-flex">
          <div class="toast-body d-flex align-items-center gap-2">
            <i class="bi" [ngClass]="{
              'bi-check-circle-fill': toast.type === 'success',
              'bi-exclamation-triangle-fill': toast.type === 'danger' || toast.type === 'warning',
              'bi-info-circle-fill': toast.type === 'info'
            }"></i>
            <span>{{ toast.message }}</span>
          </div>
          <button
            type="button"
            class="btn-close btn-close-white me-2 m-auto"
            [class.btn-close-dark]="toast.type === 'warning'"
            (click)="toastService.remove(toast.id)"
            aria-label="Close"
          ></button>
        </div>
      </div>
    </div>
  `
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}
}
