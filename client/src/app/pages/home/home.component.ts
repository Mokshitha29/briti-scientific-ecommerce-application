import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { Product } from '../../core/models/product.model';
import { Category } from '../../core/models/category.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProductCardComponent, LoadingSpinnerComponent],
  template: `
    <!-- 1. Hero Section -->
    <section class="hero-gradient py-5 text-white">
      <div class="container-fluid px-lg-5 py-4">
        <div class="row align-items-center gy-4">
          <div class="col-12 col-lg-7">
            <span class="badge bg-warning text-dark px-3 py-2 fw-bold text-uppercase mb-3">
              <i class="bi bi-award-fill me-1"></i> ISO 9001:2015 & ISO 17034 Accredited
            </span>
            <h1 class="display-4 fw-bold text-white mb-3 lh-sm">
              Professional Scientific Chemicals & Laboratory Products
            </h1>
            <p class="lead text-light opacity-90 mb-4 pe-lg-5">
              Quality chemicals, certified reference standards, and high-purity HPLC/LC-MS solvents engineered for rigorous analytical, academic, and pharmaceutical applications.
            </p>
            <div class="d-flex flex-wrap gap-3">
              <a routerLink="/products" class="btn btn-lg btn-warning text-dark fw-bold px-4 shadow">
                <i class="bi bi-grid-3x3-gap-fill me-2"></i> Explore Products
              </a>
              <a routerLink="/enquiry" class="btn btn-lg btn-outline-light fw-bold px-4">
                <i class="bi bi-envelope-paper me-2"></i> Enquire Now
              </a>
            </div>

            <!-- Quick Specs Strip -->
            <div class="row g-3 mt-4 pt-3 border-top border-secondary">
              <div class="col-4">
                <h4 class="fw-bold text-warning mb-0">1,500+</h4>
                <small class="text-light opacity-75">Chemical Reagents</small>
              </div>
              <div class="col-4">
                <h4 class="fw-bold text-warning mb-0">99.9%</h4>
                <small class="text-light opacity-75">Assayed Purity</small>
              </div>
              <div class="col-4">
                <h4 class="fw-bold text-warning mb-0">NIST</h4>
                <small class="text-light opacity-75">Traceable Standards</small>
              </div>
            </div>
          </div>

          <div class="col-12 col-lg-5 text-center">
            <div class="p-3 bg-white bg-opacity-10 rounded-4 shadow-lg border border-light border-opacity-25">
              <img
                src="https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800&auto=format&fit=crop&q=80"
                alt="Laboratory Flasks and Analysis"
                class="img-fluid rounded-3 shadow"
                style="max-height: 380px; width: 100%; object-fit: cover;"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. Product Categories Section -->
    <section class="py-5 bg-light">
      <div class="container-fluid px-lg-5">
        <div class="d-flex justify-content-between align-items-end mb-4">
          <div>
            <span class="text-uppercase text-primary fw-bold small tracking-wider">Product Categories</span>
            <h2 class="fw-bold text-navy mb-0">Browse by Chemical Category</h2>
          </div>
          <a routerLink="/products" class="btn btn-outline-primary btn-sm fw-semibold">
            View All <i class="bi bi-arrow-right ms-1"></i>
          </a>
        </div>

        <div class="row g-3">
          <div *ngFor="let cat of categories.slice(0, 8)" class="col-6 col-md-4 col-lg-3">
            <a
              [routerLink]="['/products']"
              [queryParams]="{ category: cat.name }"
              class="card h-100 scientific-card text-decoration-none border p-3 d-flex flex-column text-center group-hover"
            >
              <div class="bg-light rounded-circle mx-auto p-3 mb-3 d-flex align-items-center justify-content-center" style="width: 60px; height: 60px;">
                <i class="bi bi-bezier2 fs-3 text-navy"></i>
              </div>
              <h6 class="fw-bold text-navy mb-1">{{ cat.name }}</h6>
              <p class="text-muted small mb-0 text-truncate">{{ cat.description || 'Certified laboratory materials' }}</p>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. Featured Products from MongoDB -->
    <section class="py-5 bg-white border-top border-bottom">
      <div class="container-fluid px-lg-5">
        <div class="d-flex justify-content-between align-items-end mb-4">
          <div>
            <span class="text-uppercase text-primary fw-bold small tracking-wider">Live Inventory</span>
            <h2 class="fw-bold text-navy mb-0">Featured Chemical Products</h2>
          </div>
          <a routerLink="/products" class="btn btn-briti-primary btn-sm">
            View Catalog <i class="bi bi-arrow-right ms-1"></i>
          </a>
        </div>

        <app-loading-spinner [show]="loadingProducts" message="Loading live chemicals from database..."></app-loading-spinner>

        <div *ngIf="!loadingProducts" class="row g-4">
          <div *ngFor="let product of featuredProducts" class="col-12 col-sm-6 col-md-4 col-lg-3">
            <app-product-card [product]="product" (addToCart)="onAddToCart($event)"></app-product-card>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. Why Choose Us Section -->
    <section class="py-5 bg-light">
      <div class="container-fluid px-lg-5">
        <div class="text-center mb-5">
          <span class="text-uppercase text-primary fw-bold small tracking-wider">Quality Assurance</span>
          <h2 class="fw-bold text-navy">Why Choose Briti Scientific?</h2>
          <p class="text-muted mx-auto" style="max-width: 600px;">
            Trusted by research labs, universities, and pharmaceutical QA/QC laboratories nationwide.
          </p>
        </div>

        <div class="row g-4">
          <div class="col-12 col-md-6 col-lg-3">
            <div class="p-4 bg-white rounded border h-100 shadow-sm text-center">
              <div class="bg-primary bg-opacity-10 text-primary rounded-circle mx-auto p-3 mb-3 d-flex align-items-center justify-content-center" style="width: 64px; height: 64px;">
                <i class="bi bi-shield-check fs-2"></i>
              </div>
              <h5 class="fw-bold text-navy">Quality-Focused Products</h5>
              <p class="text-muted small mb-0">Every batch comes with a verified Certificate of Analysis (CoA) and chromatographic purity test.</p>
            </div>
          </div>

          <div class="col-12 col-md-6 col-lg-3">
            <div class="p-4 bg-white rounded border h-100 shadow-sm text-center">
              <div class="bg-success bg-opacity-10 text-success rounded-circle mx-auto p-3 mb-3 d-flex align-items-center justify-content-center" style="width: 64px; height: 64px;">
                <i class="bi bi-truck fs-2"></i>
              </div>
              <h5 class="fw-bold text-navy">Reliable Supply</h5>
              <p class="text-muted small mb-0">Specialized hazardous chemical packaging and temperature-controlled logistics for fast fulfillment.</p>
            </div>
          </div>

          <div class="col-12 col-md-6 col-lg-3">
            <div class="p-4 bg-white rounded border h-100 shadow-sm text-center">
              <div class="bg-info bg-opacity-10 text-info rounded-circle mx-auto p-3 mb-3 d-flex align-items-center justify-content-center" style="width: 64px; height: 64px;">
                <i class="bi bi-clipboard2-pulse fs-2"></i>
              </div>
              <h5 class="fw-bold text-navy">Analytical Standards</h5>
              <p class="text-muted small mb-0">NIST traceable standards for AAS, ICP, GC, and HPLC instrument calibration.</p>
            </div>
          </div>

          <div class="col-12 col-md-6 col-lg-3">
            <div class="p-4 bg-white rounded border h-100 shadow-sm text-center">
              <div class="bg-warning bg-opacity-10 text-warning rounded-circle mx-auto p-3 mb-3 d-flex align-items-center justify-content-center" style="width: 64px; height: 64px;">
                <i class="bi bi-headset fs-2 text-dark"></i>
              </div>
              <h5 class="fw-bold text-navy">Technical Support</h5>
              <p class="text-muted small mb-0">Dedicated chemical specialists to assist with custom formulations and bulk laboratory procurement.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. Scientific / Laboratory Accreditation Banner -->
    <section class="py-5 bg-navy text-white text-center">
      <div class="container py-3">
        <h3 class="fw-bold mb-3 text-white">Precision In Every Molecule, Integrity In Every Test</h3>
        <p class="lead opacity-75 mb-4 mx-auto" style="max-width: 700px;">
          Need bulk commercial supply, customized impurity synthesis, or specialized packing options? Submit a chemical enquiry directly to our technical desk.
        </p>
        <a routerLink="/enquiry" class="btn btn-warning btn-lg text-dark fw-bold px-5">
          <i class="bi bi-send-fill me-2"></i> Request Commercial Quote
        </a>
      </div>
    </section>
  `
})
export class HomeComponent implements OnInit {
  categories: Category[] = [];
  featuredProducts: Product[] = [];
  loadingProducts: boolean = true;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private cartService: CartService,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    this.categoryService.getCategories().subscribe({
      next: (res) => {
        if (res.success) this.categories = res.data;
      }
    });

    this.productService.getProducts({ limit: 8, sort: 'newest' }).subscribe({
      next: (res) => {
        if (res.success) this.featuredProducts = res.data;
        this.loadingProducts = false;
      },
      error: () => {
        this.loadingProducts = false;
      }
    });
  }

  onAddToCart(event: { productId: string; packingSize: string; quantity: number }) {
    if (!this.authService.isLoggedIn()) {
      this.toastService.info('Please log in to add products to your cart.');
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/' } });
      return;
    }

    this.cartService.addToCart(event.productId, event.packingSize, event.quantity).subscribe({
      next: (res) => {
        this.toastService.success(res.message || 'Product added to cart!');
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to add product to cart.');
      }
    });
  }
}
