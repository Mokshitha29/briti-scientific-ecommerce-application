import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid px-lg-5 py-4">
      <div class="mb-4 pb-2 border-bottom">
        <h2 class="fw-bold text-navy mb-1">Scientific Resources & Technical Library</h2>
        <small class="text-muted">Regulatory certificates, Certificate of Analysis (CoA) guides, safety data documentation, and chemical grade definitions</small>
      </div>

      <!-- Overview Cards -->
      <div class="row g-4 mb-4">
        <div class="col-12 col-md-6 col-lg-3">
          <div class="card scientific-card border shadow-sm p-4 h-100 text-center">
            <div class="rounded-circle bg-light text-primary mx-auto p-3 mb-3 d-flex align-items-center justify-content-center" style="width: 60px; height: 60px;">
              <i class="bi bi-file-earmark-medical fs-3"></i>
            </div>
            <h5 class="fw-bold text-navy mb-2">Safety Data Sheets (SDS)</h5>
            <p class="text-muted small mb-0">General information about chemical hazards, safe handling, storage, personal protective measures, and emergency procedures.</p>
          </div>
        </div>

        <div class="col-12 col-md-6 col-lg-3">
          <div class="card scientific-card border shadow-sm p-4 h-100 text-center">
            <div class="rounded-circle bg-light text-success mx-auto p-3 mb-3 d-flex align-items-center justify-content-center" style="width: 60px; height: 60px;">
              <i class="bi bi-patch-check fs-3"></i>
            </div>
            <h5 class="fw-bold text-navy mb-2">Certificate of Analysis (CoA)</h5>
            <p class="text-muted small mb-0">Learn about Certificates of Analysis, including batch identification, purity testing, analytical methods, and quality verification.</p>
          </div>
        </div>

        <div class="col-12 col-md-6 col-lg-3">
          <div class="card scientific-card border shadow-sm p-4 h-100 text-center">
            <div class="rounded-circle bg-light text-warning mx-auto p-3 mb-3 d-flex align-items-center justify-content-center" style="width: 60px; height: 60px;">
              <i class="bi bi-award fs-3"></i>
            </div>
            <h5 class="fw-bold text-navy mb-2">Reference Standards & Quality</h5>
            <p class="text-muted small mb-0">Information about reference standards, Certified Reference Materials (CRMs), traceability, and laboratory quality practices.</p>
          </div>
        </div>

        <div class="col-12 col-md-6 col-lg-3">
          <div class="card scientific-card border shadow-sm p-4 h-100 text-center">
            <div class="rounded-circle bg-light text-info mx-auto p-3 mb-3 d-flex align-items-center justify-content-center" style="width: 60px; height: 60px;">
              <i class="bi bi-box-seam fs-3"></i>
            </div>
            <h5 class="fw-bold text-navy mb-2">Packaging & Handling Guidelines</h5>
            <p class="text-muted small mb-0">General guidance on chemical packaging, storage, transportation, labeling, and safe handling practices.</p>
          </div>
        </div>
      </div>

      <!-- Chemical Purity Grades Table -->
      <div class="card scientific-card border shadow-sm p-4 mb-4">
        <h5 class="fw-bold text-navy mb-3 pb-2 border-bottom">
          <i class="bi bi-info-circle-fill text-primary me-2"></i> Chemical Purity Grade Reference Matrix
        </h5>
        <div class="table-responsive-custom">
          <table class="scientific-table mb-0">
            <thead>
              <tr>
                <th>Grade Designation</th>
                <th>Typical Purity</th>
                <th>Primary Application</th>
                <th>Testing Methods</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong class="text-navy">LC-MS Ultra Grade</strong></td>
                <td>&ge; 99.9%</td>
                <td>High-resolution Liquid Chromatography-Mass Spectrometry</td>
                <td>Electrospray ionization trace impurity profiling, sub-ppb metal tests</td>
              </tr>
              <tr>
                <td><strong class="text-navy">HPLC Gradient Grade</strong></td>
                <td>&ge; 99.8%</td>
                <td>Gradient elution HPLC, UV spectrophotometry mobile phases</td>
                <td>UV absorbance cutoff tests at 210 nm / 254 nm, fluorescence trace assay</td>
              </tr>
              <tr>
                <td><strong class="text-navy">Analytical Reagent (AR)</strong></td>
                <td>&ge; 99.5%</td>
                <td>Quantitative chemical analysis, precision volumetric titrations</td>
                <td>ACS monograph compliance, heavy metal precipitate quantification</td>
              </tr>
              <tr>
                <td><strong class="text-navy">Pure / Laboratory Grade (LR)</strong></td>
                <td>&ge; 98.0% - 99.0%</td>
                <td>Preparative synthesis, general education laboratories</td>
                <td>Boiling point assay, gravimetric residue checks</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Assistance Banner -->
      <div class="card scientific-card bg-light border p-4 text-center">
        <h5 class="fw-bold text-navy mb-2">Need Custom Technical Documentation or Batch CoA?</h5>
        <p class="text-muted small mb-3">Our analytical laboratory team provides batch-specific documentation and custom standard synthesis upon request.</p>
        <div class="d-flex justify-content-center gap-2">
          <a routerLink="/enquiry" class="btn btn-briti-primary px-4 fw-semibold">
            <i class="bi bi-question-diamond me-1"></i> Submit Chemical Enquiry
          </a>
          <a routerLink="/contact" class="btn btn-outline-secondary px-4 fw-semibold">
            <i class="bi bi-envelope me-1"></i> Contact Desk
          </a>
        </div>
      </div>
    </div>
  `
})
export class ResourcesComponent {}
