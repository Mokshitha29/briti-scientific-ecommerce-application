import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { Cart, CartItem } from '../../core/models/cart.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ConfirmationDialogComponent
  ],
  template: `
    <div class="container-fluid px-lg-5 py-4">
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb scientific-breadcrumb">
          <li class="breadcrumb-item"><a routerLink="/">Home</a></li>
          <li class="breadcrumb-item active" aria-current="page">Shopping Cart</li>
        </ol>
      </nav>

      <div class="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 class="fw-bold text-navy mb-0">Chemical Order Cart</h2>
          <small class="text-muted">Review selected packings and quantities before requisition</small>
        </div>
        <button
          *ngIf="cart && cart.items.length > 0"
          (click)="confirmClearCart = true"
          class="btn btn-sm btn-outline-danger"
        >
          <i class="bi bi-trash3 me-1"></i> Clear Cart
        </button>
      </div>

      <app-loading-spinner [show]="isLoading" message="Retrieving your persisted cart..."></app-loading-spinner>

      <app-empty-state
        *ngIf="!isLoading && (!cart || cart.items.length === 0)"
        title="Your chemical cart is empty"
        description="You have not added any reagents or standards to your cart yet. Explore our catalog to place orders."
        icon="bi-cart-x"
        actionText="Explore Chemical Catalog"
        actionLink="/products"
      ></app-empty-state>

      <!-- Cart Content -->
      <div *ngIf="!isLoading && cart && cart.items.length > 0" class="row g-4">
        <!-- Items Table -->
        <div class="col-12 col-lg-8">
          <div class="card scientific-card border shadow-sm">
            <div class="table-responsive-custom">
              <table class="scientific-table mb-0">
                <thead>
                  <tr>
                    <th>Product & Packing</th>
                    <th>Unit Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                    <th class="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of cart.items">
                    <td>
                      <div class="d-flex align-items-center gap-3">
                        <div class="bg-light rounded p-1 border text-center" style="width: 48px; height: 48px;">
                          <i class="bi bi-flask fs-4 text-primary"></i>
                        </div>
                        <div>
                          <a [routerLink]="['/products', getProductId(item)]" class="fw-bold text-navy text-decoration-none d-block">
                            {{ item.productName }}
                          </a>
                          <span class="badge bg-light text-dark border me-1">{{ item.packingSize }}</span>
                        </div>
                      </div>
                    </td>
                    <td class="fw-semibold">₹{{ item.price | number:'1.2-2' }}</td>
                    <td>
                      <div class="input-group input-group-sm" style="width: 110px;">
                        <button
                          class="btn btn-outline-secondary"
                          type="button"
                          (click)="updateQty(item, item.quantity - 1)"
                          [disabled]="item.quantity <= 1 || isUpdating"
                        >
                          <i class="bi bi-dash"></i>
                        </button>
                        <input
                          type="text"
                          class="form-control text-center fw-bold bg-white"
                          [value]="item.quantity"
                          readonly
                        />
                        <button
                          class="btn btn-outline-secondary"
                          type="button"
                          (click)="updateQty(item, item.quantity + 1)"
                          [disabled]="isUpdating"
                        >
                          <i class="bi bi-plus"></i>
                        </button>
                      </div>
                    </td>
                    <td class="fw-bold text-dark">
                      ₹{{ (item.price * item.quantity) | number:'1.2-2' }}
                    </td>
                    <td class="text-end">
                      <button
                        (click)="removeItem(item._id)"
                        class="btn btn-sm btn-outline-danger border-0"
                        title="Remove item"
                      >
                        <i class="bi bi-trash3"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="mt-3">
            <a routerLink="/products" class="btn btn-outline-secondary btn-sm">
              <i class="bi bi-arrow-left me-1"></i> Continue Shopping
            </a>
          </div>
        </div>

        <!-- Order Summary Card -->
        <div class="col-12 col-lg-4">
          <div class="card scientific-card border shadow-sm p-4 sticky-top" style="top: 80px;">
            <h5 class="fw-bold text-navy mb-3 pb-2 border-bottom">Order Summary</h5>

            <div class="d-flex justify-content-between mb-2">
              <span class="text-muted">Subtotal ({{ cart.itemCount }} items)</span>
              <span class="fw-semibold text-dark">₹{{ cart.subtotal | number:'1.2-2' }}</span>
            </div>

            <div class="d-flex justify-content-between mb-2">
              <span class="text-muted">Estimated GST (18%)</span>
              <span class="fw-semibold text-dark">₹{{ cart.gstAmount | number:'1.2-2' }}</span>
            </div>

            <div class="d-flex justify-content-between mb-3">
              <span class="text-muted">Standard Chemical Logistics</span>
              <span class="text-success fw-semibold">FREE (Institutional)</span>
            </div>

            <hr class="border-secondary opacity-25 my-3" />

            <div class="d-flex justify-content-between align-items-center mb-4">
              <span class="fw-bold text-dark fs-5">Grand Total</span>
              <span class="fw-bold text-navy fs-4">₹{{ cart.totalAmount | number:'1.2-2' }}</span>
            </div>

            <a routerLink="/checkout" class="btn btn-briti-primary w-100 py-2 fw-semibold mb-2">
              Proceed to Checkout <i class="bi bi-arrow-right ms-1"></i>
            </a>

            <div class="text-center mt-3">
              <small class="text-muted d-block">
                <i class="bi bi-shield-check text-success me-1"></i> Verified Demo Order Calculation
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Dialog for Clear Cart -->
    <app-confirmation-dialog
      [isOpen]="confirmClearCart"
      title="Clear Entire Cart"
      message="Are you sure you want to remove all items from your chemical cart?"
      confirmText="Yes, Clear Cart"
      [isDanger]="true"
      (confirmed)="onClearCartConfirmed()"
      (cancelled)="confirmClearCart = false"
    ></app-confirmation-dialog>
  `
})
export class CartComponent implements OnInit {
  cart: Cart | null = null;
  isLoading: boolean = true;
  isUpdating: boolean = false;
  confirmClearCart: boolean = false;

  constructor(
    private cartService: CartService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    this.isLoading = true;
    this.cartService.getCart().subscribe({
      next: (res) => {
        if (res.success) {
          this.cart = res.data;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      }
    });
  }

  getProductId(item: CartItem): string {
    if (typeof item.productId === 'object' && item.productId !== null) {
      return (item.productId as any)._id;
    }
    return String(item.productId);
  }

  updateQty(item: CartItem, newQty: number) {
    if (newQty <= 0) return;
    this.isUpdating = true;
    this.cartService.updateQuantity(item._id, newQty).subscribe({
      next: (res) => {
        this.isUpdating = false;
        if (res.success) {
          this.cart = res.data;
          this.toastService.success('Cart updated.');
        }
      },
      error: (err) => {
        this.isUpdating = false;
        this.toastService.error(err.error?.message || 'Could not update quantity.');
      }
    });
  }

  removeItem(itemId: string) {
    this.cartService.removeItem(itemId).subscribe({
      next: (res) => {
        if (res.success) {
          this.cart = res.data;
          this.toastService.info('Item removed from cart.');
        }
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to remove item.');
      }
    });
  }

  onClearCartConfirmed() {
    this.confirmClearCart = false;
    this.cartService.clearCart().subscribe({
      next: () => {
        this.cart = null;
        this.toastService.info('Cart cleared.');
      }
    });
  }
}
