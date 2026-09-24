import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid px-lg-5 py-4">
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb scientific-breadcrumb">
          <li class="breadcrumb-item"><a routerLink="/">Home</a></li>
          <li class="breadcrumb-item active" aria-current="page">About Us</li>
        </ol>
      </nav>

      <!-- Hero Header -->
      <div class="card scientific-card hero-gradient p-5 mb-5 border-0 shadow">
        <div class="row align-items-center">
          <div class="col-12 col-lg-8">
            <span class="badge bg-warning text-dark px-3 py-1 fw-bold text-uppercase mb-2">Scientific Excellence</span>
            <h1 class="display-5 fw-bold text-white mb-3">About Briti Scientific Platform</h1>
            <p class="lead opacity-90 mb-0">
              Dedicated to accelerating scientific discovery through certified reference materials, analytical reagents, and high-purity laboratory solvents.
            </p>
          </div>
        </div>
      </div>

      <!-- Prototype Clarification Note -->
      <div class="alert alert-info border-info shadow-sm mb-5 p-4">
        <div class="d-flex align-items-start gap-3">
          <i class="bi bi-info-circle-fill fs-3 text-info"></i>
          <div>
            <h5 class="fw-bold mb-1">Architecture & Demonstration Notice</h5>
            <p class="mb-0 text-dark small">
              This prototype demonstrates a professional scientific chemical e-commerce platform inspired by modern B2B laboratory product websites. All features—including MongoDB data persistence, JWT role authorization, cart stock validation, simulated payment processing, and admin management—are 100% operational.
            </p>
          </div>
        </div>
      </div>

      <!-- Core Pillars -->
      <div class="row g-4 mb-5">
        <div class="col-12 col-md-4">
          <div class="card scientific-card border p-4 h-100 text-center shadow-sm">
            <div class="bg-primary bg-opacity-10 text-primary rounded-circle mx-auto p-3 mb-3 d-flex align-items-center justify-content-center" style="width: 60px; height: 60px;">
              <i class="bi bi-shield-check fs-2"></i>
            </div>
            <h5 class="fw-bold text-navy">Quality & Traceability</h5>
            <p class="text-muted small mb-0">
              Traceability to NIST primary reference materials with comprehensive chromatographic purity data and impurity profiling.
            </p>
          </div>
        </div>

        <div class="col-12 col-md-4">
          <div class="card scientific-card border p-4 h-100 text-center shadow-sm">
            <div class="bg-success bg-opacity-10 text-success rounded-circle mx-auto p-3 mb-3 d-flex align-items-center justify-content-center" style="width: 60px; height: 60px;">
              <i class="bi bi-box-seam fs-2"></i>
            </div>
            <h5 class="fw-bold text-navy">Specialized Packaging</h5>
            <p class="text-muted small mb-0">
              Certified amber glass bottles, septum vials, and HDPE containers with specialized safety caps preventing moisture contamination.
            </p>
          </div>
        </div>

        <div class="col-12 col-md-4">
          <div class="card scientific-card border p-4 h-100 text-center shadow-sm">
            <div class="bg-warning bg-opacity-10 text-warning rounded-circle mx-auto p-3 mb-3 d-flex align-items-center justify-content-center" style="width: 60px; height: 60px;">
              <i class="bi bi-award fs-2 text-dark"></i>
            </div>
            <h5 class="fw-bold text-navy">ISO Accreditations</h5>
            <p class="text-muted small mb-0">
              Manufactured and distributed in compliance with ISO 9001:2015 quality management and ISO 17034 reference material standards.
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AboutComponent {}
