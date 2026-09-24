import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="card h-100 scientific-card border">
      <!-- Product Image with Fallback -->
      <div class="position-relative bg-light text-center p-3 border-bottom" style="height: 180px; overflow: hidden;">
        <img
          [src]="product.image || fallbackImage"
          (error)="onImageError($event)"
          [alt]="product.name"
          class="img-fluid h-100 object-fit-contain transition-scale"
        />
        <span class="position-absolute top-0 end-0 m-2 badge-purity">
          {{ product.purity }}
        </span>
      </div>

      <!-- Card Body -->
      <div class="card-body d-flex flex-column p-3">
        <!-- CAS and Code Header -->
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="badge-cas" title="CAS Registry Number">CAS: {{ product.casNumber }}</span>
          <span class="text-muted small fw-semibold">{{ product.productCode }}</span>
        </div>

        <!-- Product Title -->
        <h6 class="card-title fw-bold text-dark mb-1 text-truncate" [title]="product.name">
          <a [routerLink]="['/products', product._id]" class="text-navy text-decoration-none">
            {{ product.name }}
          </a>
        </h6>

        <!-- Category -->
        <p class="text-muted small mb-2 text-truncate">
          {{ getCategoryName() }}
        </p>

        <!-- Stock Status Badge -->
        <div class="mb-3">
          <span *ngIf="totalStock > 10" class="badge-stock-in">
            <i class="bi bi-check-circle-fill me-1"></i> In Stock
          </span>
          <span *ngIf="totalStock > 0 && totalStock <= 10" class="badge-stock-low">
            <i class="bi bi-exclamation-circle-fill me-1"></i> Low Stock ({{ totalStock }} left)
          </span>
          <span *ngIf="totalStock <= 0" class="badge-stock-out">
            <i class="bi bi-x-circle-fill me-1"></i> Out of Stock
          </span>
        </div>

        <!-- Price & Action Footer -->
        <div class="mt-auto pt-2 border-top d-flex align-items-center justify-content-between">
          <div>
            <span class="text-muted small d-block" style="font-size: 0.72rem;">Starting from</span>
            <span class="fw-bold fs-5 text-dark">₹{{ lowestPrice | number:'1.2-2' }}</span>
          </div>
          <div class="d-flex gap-1">
            <a [routerLink]="['/products', product._id]" class="btn btn-sm btn-briti-outline" title="View Specifications">
              <i class="bi bi-eye"></i> Details
            </a>
            <button
              *ngIf="totalStock > 0"
              (click)="onAddToCart()"
              class="btn btn-sm btn-briti-primary"
              title="Add to Cart"
            >
              <i class="bi bi-cart-plus"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .transition-scale {
      transition: transform 0.25s ease-in-out;
    }
    .scientific-card:hover .transition-scale {
      transform: scale(1.05);
    }
  `]
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Output() addToCart = new EventEmitter<{ productId: string; packingSize: string; quantity: number }>();

  fallbackImage = 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&auto=format&fit=crop&q=60';

  get lowestPrice(): number {
    if (!this.product.packings || this.product.packings.length === 0) return 0;
    return Math.min(...this.product.packings.map((p) => p.price));
  }

  get totalStock(): number {
    if (!this.product.packings || this.product.packings.length === 0) return 0;
    return this.product.packings.reduce((sum, p) => sum + (p.stock || 0), 0);
  }

  getCategoryName(): string {
    if (!this.product.category) return 'Chemicals';
    if (typeof this.product.category === 'object' && 'name' in this.product.category) {
      return this.product.category.name;
    }
    return String(this.product.category);
  }

  onImageError(event: any) {
    event.target.src = this.fallbackImage;
  }

  onAddToCart() {
    if (this.product.packings && this.product.packings.length > 0) {
      // Find first packing with stock > 0
      const availablePacking = this.product.packings.find((p) => p.stock > 0) || this.product.packings[0];
      this.addToCart.emit({
        productId: this.product._id,
        packingSize: availablePacking.size,
        quantity: 1
      });
    }
  }
}
