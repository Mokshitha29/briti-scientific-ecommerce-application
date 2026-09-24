import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Product, Packing } from '../../../core/models/product.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="container-fluid px-lg-5 py-4">
      <!-- Breadcrumb -->
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb scientific-breadcrumb">
          <li class="breadcrumb-item"><a routerLink="/">Home</a></li>
          <li class="breadcrumb-item"><a routerLink="/products">Products</a></li>
          <li class="breadcrumb-item active" aria-current="page">{{ product?.name || 'Details' }}</li>
        </ol>
      </nav>

      <app-loading-spinner [show]="isLoading" message="Loading technical specifications..."></app-loading-spinner>

      <div *ngIf="!isLoading && product" class="row g-4">
        <!-- Left: Image & Certifications -->
        <div class="col-12 col-lg-5">
          <div class="card scientific-card border p-4 text-center bg-white shadow-sm mb-3">
            <div class="p-3 bg-light rounded" style="min-height: 320px; display: flex; align-items: center; justify-content: center;">
              <img
                [src]="product.image || fallbackImage"
                (error)="onImageError($event)"
                [alt]="product.name"
                class="img-fluid rounded"
                style="max-height: 280px; object-fit: contain;"
              />
            </div>
            <div class="mt-3 d-flex justify-content-center gap-2 flex-wrap">
              <span class="badge bg-light text-dark border">
                <i class="bi bi-patch-check text-primary me-1"></i> CoA Provided
              </span>
              <span class="badge bg-light text-dark border">
                <i class="bi bi-shield-check text-success me-1"></i> Quality Tested
              </span>
              <span class="badge bg-light text-dark border">
                <i class="bi bi-box-seam text-secondary me-1"></i> Amber Glass / HDPE
              </span>
            </div>
          </div>
        </div>

        <!-- Right: Chemical Specs & Ordering Matrix -->
        <div class="col-12 col-lg-7">
          <div class="card scientific-card border p-4 shadow-sm">
            <!-- Badges Header -->
            <div class="d-flex flex-wrap gap-2 align-items-center mb-2">
              <span class="badge-purity">{{ product.purity }}</span>
              <span class="badge-cas">CAS: {{ product.casNumber }}</span>
              <span class="text-muted small fw-semibold">Code: {{ product.productCode }}</span>
            </div>

            <!-- Product Title -->
            <h2 class="fw-bold text-navy mb-2">{{ product.name }}</h2>

            <!-- Category -->
            <p class="text-muted small mb-3">
              <strong>Category:</strong> {{ getCategoryName() }}
            </p>

            <!-- Description -->
            <p class="text-secondary mb-4 lh-base">
              {{ product.description || 'High purity analytical grade reagent suitable for research and industrial quality control.' }}
            </p>

            <!-- Specification Table -->
            <div class="table-responsive-custom mb-4">
              <table class="table table-sm table-bordered align-middle small mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Product Code</th>
                    <th>CAS Registry #</th>
                    <th>Purity Grade</th>
                    <th>HSN Code</th>
                    <th>GST Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="fw-bold text-navy">{{ product.productCode }}</td>
                    <td class="font-monospace">{{ product.casNumber }}</td>
                    <td>{{ product.purity }}</td>
                    <td>{{ product.hsnCode }}</td>
                    <td>{{ product.gst }}%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Dynamic Packing & Price Selector -->
            <div class="p-3 bg-light rounded border mb-4">
              <div class="row g-3 align-items-end">
                <!-- Packing Options Dropdown -->
                <div class="col-12 col-sm-6">
                  <label class="form-label small fw-bold text-dark mb-1">Select Packing Size *</label>
                  <select
                    class="form-select"
                    [(ngModel)]="selectedPackingIndex"
                    (change)="onPackingChange()"
                  >
                    <option *ngFor="let p of product.packings; let i = index" [value]="i">
                      {{ p.size }} — ₹{{ p.price | number:'1.2-2' }} (Stock: {{ p.stock }})
                    </option>
                  </select>
                </div>

                <!-- Current Price Display -->
                <div class="col-12 col-sm-6">
                  <span class="text-muted small d-block">Unit Price (Exclusive of GST)</span>
                  <span class="display-6 fw-bold text-dark">₹{{ selectedPacking?.price | number:'1.2-2' }}</span>
                </div>
              </div>

              <!-- Stock Availability Indicator -->
              <div class="mt-3 pt-3 border-top d-flex align-items-center justify-content-between">
                <div>
                  <span *ngIf="currentStock > 10" class="badge-stock-in fs-6 py-1 px-3">
                    <i class="bi bi-check-circle-fill me-1"></i> In Stock ({{ currentStock }} units available)
                  </span>
                  <span *ngIf="currentStock > 0 && currentStock <= 10" class="badge-stock-low fs-6 py-1 px-3">
                    <i class="bi bi-exclamation-triangle-fill me-1"></i> Low Stock (Only {{ currentStock }} left)
                  </span>
                  <span *ngIf="currentStock <= 0" class="badge-stock-out fs-6 py-1 px-3">
                    <i class="bi bi-x-circle-fill me-1"></i> Out of Stock
                  </span>
                </div>

                <!-- Quantity Picker -->
                <div class="d-flex align-items-center gap-2">
                  <span class="small fw-bold text-muted">Quantity:</span>
                  <div class="input-group input-group-sm" style="width: 120px;">
                    <button
                      class="btn btn-outline-secondary"
                      type="button"
                      (click)="decrementQty()"
                      [disabled]="quantity <= 1 || currentStock <= 0"
                    >
                      <i class="bi bi-dash"></i>
                    </button>
                    <input
                      type="text"
                      class="form-control text-center fw-bold bg-white"
                      [value]="quantity"
                      readonly
                    />
                    <button
                      class="btn btn-outline-secondary"
                      type="button"
                      (click)="incrementQty()"
                      [disabled]="quantity >= currentStock || currentStock <= 0"
                    >
                      <i class="bi bi-plus"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="d-flex flex-wrap gap-3">
              <button
                (click)="onAddToCart()"
                class="btn btn-briti-primary px-4 py-2 fw-semibold flex-grow-1"
                [disabled]="currentStock <= 0 || isAddingToCart"
              >
                <span *ngIf="isAddingToCart" class="spinner-border spinner-border-sm me-2"></span>
                <i *ngIf="!isAddingToCart" class="bi bi-cart-plus me-2"></i>
                {{ currentStock > 0 ? 'Add to Cart' : 'Currently Unavailable' }}
              </button>

              <button
                (click)="onEnquireNow()"
                class="btn btn-briti-outline px-4 py-2 fw-semibold"
              >
                <i class="bi bi-envelope-paper me-2"></i> Enquire for Bulk / Quote
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProductDetailsComponent implements OnInit {
  product: Product | null = null;
  isLoading: boolean = true;
  isAddingToCart: boolean = false;
  selectedPackingIndex: number = 0;
  quantity: number = 1;
  fallbackImage = 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&auto=format&fit=crop&q=60';

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  get selectedPacking(): Packing | undefined {
    return this.product?.packings[this.selectedPackingIndex];
  }

  get currentStock(): number {
    return this.selectedPacking?.stock || 0;
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.fetchProductDetails(id);
      }
    });
  }

  fetchProductDetails(id: string) {
    this.isLoading = true;
    this.productService.getProductById(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.product = res.data;
          this.selectedPackingIndex = 0;
          this.quantity = 1;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.toastService.error('Product not found.');
        this.router.navigate(['/products']);
      }
    });
  }

  onPackingChange() {
    this.quantity = 1;
  }

  incrementQty() {
    if (this.quantity < this.currentStock) {
      this.quantity++;
    } else {
      this.toastService.warning(`Only ${this.currentStock} units available.`);
    }
  }

  decrementQty() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  getCategoryName(): string {
    if (!this.product?.category) return 'Chemicals';
    if (typeof this.product.category === 'object' && 'name' in this.product.category) {
      return this.product.category.name;
    }
    return String(this.product.category);
  }

  onImageError(event: any) {
    event.target.src = this.fallbackImage;
  }

  onAddToCart() {
    if (!this.authService.isLoggedIn()) {
      this.toastService.info('Please log in to add items to your cart.');
      this.router.navigate(['/login'], { queryParams: { returnUrl: `/products/${this.product?._id}` } });
      return;
    }

    if (!this.selectedPacking || this.currentStock <= 0) {
      this.toastService.warning('Selected packing is out of stock.');
      return;
    }

    this.isAddingToCart = true;
    this.cartService.addToCart(this.product!._id, this.selectedPacking.size, this.quantity).subscribe({
      next: (res) => {
        this.isAddingToCart = false;
        this.toastService.success(`Added ${this.quantity} x ${this.product!.name} (${this.selectedPacking!.size}) to cart!`);
      },
      error: (err) => {
        this.isAddingToCart = false;
        this.toastService.error(err.error?.message || 'Could not add product to cart.');
      }
    });
  }

  onEnquireNow() {
    if (this.product) {
      this.router.navigate(['/enquiry'], {
        queryParams: {
          chemical: this.product.name,
          cas: this.product.casNumber,
          quantity: `${this.quantity} x ${this.selectedPacking?.size || 'bottle'}`
        }
      });
    }
  }
}
