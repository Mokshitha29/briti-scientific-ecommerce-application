import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="bg-dark text-white pt-5 pb-3 mt-auto">
      <div class="container-fluid px-lg-5">
        <div class="row g-4 mb-4">
          <!-- Company Bio & Accreditation -->
          <div class="col-12 col-md-4">
            <div class="d-flex align-items-center mb-3">
              <div class="bg-primary text-white rounded p-2 me-2">
                <i class="bi bi-radioactive fs-5 text-warning"></i>
              </div>
              <h5 class="fw-bold mb-0 text-white">BRITI SCIENTIFIC</h5>
            </div>
            <p class="text-light opacity-75 small">
              Quality analytical reference standards, high-purity HPLC/LC-MS solvents, and certified research chemicals for life sciences, pharmaceutical QC, and academic institutions.
            </p>
            <div class="d-flex gap-2 mt-3">
              <span class="badge bg-secondary">ISO 9001:2015</span>
              <span class="badge bg-secondary">ISO 17034 Accredited</span>
              <span class="badge bg-secondary">NIST Traceable</span>
            </div>
          </div>

          <!-- Quick Navigation -->
          <div class="col-6 col-md-2">
            <h6 class="text-uppercase fw-bold text-info mb-3 small">Quick Links</h6>
            <ul class="list-unstyled small opacity-75 d-flex flex-column gap-2">
              <li><a routerLink="/" class="text-white text-decoration-none hover-cyan">Home</a></li>
              <li><a routerLink="/products" class="text-white text-decoration-none hover-cyan">Product Catalog</a></li>
              <li><a routerLink="/about" class="text-white text-decoration-none hover-cyan">About Us</a></li>
              <li><a routerLink="/contact" class="text-white text-decoration-none hover-cyan">Contact Sales</a></li>
              <li><a routerLink="/enquiry" class="text-white text-decoration-none hover-cyan">Submit Enquiry</a></li>
            </ul>
          </div>

          <!-- Major Categories -->
          <div class="col-6 col-md-3">
            <h6 class="text-uppercase fw-bold text-info mb-3 small">Chemical Solutions</h6>
            <ul class="list-unstyled small opacity-75 d-flex flex-column gap-2">
              <li><a [routerLink]="['/products']" [queryParams]="{ category: 'Laboratory Chemicals' }" class="text-white text-decoration-none hover-cyan">Laboratory Chemicals</a></li>
              <li><a [routerLink]="['/products']" [queryParams]="{ category: 'HPLC Solvents' }" class="text-white text-decoration-none hover-cyan">HPLC Solvents</a></li>
              <li><a [routerLink]="['/products']" [queryParams]="{ category: 'Reference Standards' }" class="text-white text-decoration-none hover-cyan">Reference Standards</a></li>
              <li><a [routerLink]="['/products']" [queryParams]="{ category: 'AAS/ICP Standards' }" class="text-white text-decoration-none hover-cyan">AAS / ICP Standards</a></li>
              <li><a [routerLink]="['/products']" [queryParams]="{ category: 'Pharmaceutical Impurities' }" class="text-white text-decoration-none hover-cyan">Pharmaceutical Impurities</a></li>
            </ul>
          </div>

          <!-- Technical Support & Demo Notice -->
          <div class="col-12 col-md-3">
            <h6 class="text-uppercase fw-bold text-info mb-3 small">Contact & Support</h6>
            <ul class="list-unstyled small opacity-75 d-flex flex-column gap-2">
              <li><i class="bi bi-geo-alt-fill text-warning me-2"></i> Plot 45, Biotech Park, Genome Valley, Hyderabad, 500078</li>
              <li><i class="bi bi-telephone-fill text-warning me-2"></i> +91 40 2345 6789 (Mon-Sat 9AM-6PM)</li>
              <li><i class="bi bi-envelope-fill text-warning me-2"></i> sales&#64;britiscientific.com</li>
              <li><i class="bi bi-shield-check text-success me-2"></i> 100% Simulated Payment Safe Testing</li>
            </ul>
          </div>
        </div>

        <hr class="border-secondary opacity-50 my-4" />

        <div class="row align-items-center">
          <div class="col-12 col-md-8 text-center text-md-start small text-muted">
            &copy; 2026 Briti Scientific E-Commerce Prototype. All rights reserved.
            <div class="small mt-1 opacity-75 text-warning">
              Disclaimer: This working prototype is an independent demonstration inspired by modern B2B laboratory platforms. All transactions and product inventories are simulated demo data.
            </div>
          </div>
          <div class="col-12 col-md-4 text-center text-md-end mt-3 mt-md-0">
            <span class="badge bg-dark border border-secondary text-light">Angular 17 • Express • MongoDB</span>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .hover-cyan:hover {
      color: #38bdf8 !important;
      text-decoration: underline !important;
    }
  `]
})
export class FooterComponent {}
