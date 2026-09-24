import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-error-404',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-5 my-5 text-center">
      <div class="card scientific-card border shadow-sm p-5 mx-auto" style="max-width: 520px;">
        <div class="bg-secondary text-white rounded-circle mx-auto p-3 mb-3 d-flex align-items-center justify-content-center shadow" style="width: 80px; height: 80px;">
          <i class="bi bi-question-lg fs-1"></i>
        </div>
        <h2 class="fw-bold text-navy mb-2">Page Not Found (404)</h2>
        <p class="text-muted small mb-4">
          The scientific resource or catalog page you requested does not exist or has been moved.
        </p>
        <div>
          <a routerLink="/" class="btn btn-briti-primary fw-semibold px-4">
            <i class="bi bi-house-door me-1"></i> Back to Home
          </a>
        </div>
      </div>
    </div>
  `
})
export class Error404Component {}
