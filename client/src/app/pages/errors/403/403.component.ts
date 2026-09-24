import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-error-403',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-5 my-5 text-center">
      <div class="card scientific-card border shadow-sm p-5 mx-auto" style="max-width: 520px;">
        <div class="bg-danger text-white rounded-circle mx-auto p-3 mb-3 d-flex align-items-center justify-content-center shadow" style="width: 80px; height: 80px;">
          <i class="bi bi-shield-x fs-1"></i>
        </div>
        <h2 class="fw-bold text-navy mb-2">Access Denied (403)</h2>
        <p class="text-muted small mb-4">
          You do not have permission to access this protected area. Administrator privileges are required to view these management consoles.
        </p>
        <div>
          <a routerLink="/" class="btn btn-briti-primary fw-semibold px-4">
            <i class="bi bi-house-door me-1"></i> Go to Homepage
          </a>
        </div>
      </div>
    </div>
  `
})
export class Error403Component {}
