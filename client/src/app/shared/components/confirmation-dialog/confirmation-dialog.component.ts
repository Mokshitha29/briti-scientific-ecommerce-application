import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0, 0, 0, 0.5);" *ngIf="isOpen">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shadow border-0">
          <div class="modal-header" [ngClass]="isDanger ? 'bg-danger text-white' : 'bg-primary text-white'">
            <h5 class="modal-title fw-bold">
              <i class="bi" [ngClass]="isDanger ? 'bi-exclamation-triangle-fill me-2' : 'bi-question-circle-fill me-2'"></i>
              {{ title }}
            </h5>
            <button type="button" class="btn-close btn-close-white" (click)="onCancel()"></button>
          </div>
          <div class="modal-body py-4">
            <p class="mb-0 text-dark">{{ message }}</p>
          </div>
          <div class="modal-footer bg-light">
            <button type="button" class="btn btn-outline-secondary" (click)="onCancel()">Cancel</button>
            <button type="button" class="btn" [ngClass]="isDanger ? 'btn-danger' : 'btn-primary'" (click)="onConfirm()">
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ConfirmationDialogComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = 'Confirm Action';
  @Input() message: string = 'Are you sure you want to proceed?';
  @Input() confirmText: string = 'Confirm';
  @Input() isDanger: boolean = false;

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm() {
    this.confirmed.emit();
  }

  onCancel() {
    this.cancelled.emit();
  }
}
