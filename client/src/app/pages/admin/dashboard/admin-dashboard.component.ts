import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent],
  template: `
    <div class="container-fluid px-lg-5 py-4">
      <div class="mb-4 pb-2 border-bottom">
        <h2 class="fw-bold text-navy mb-1">Administrative Overview & Analytics</h2>
        <small class="text-muted">Real-time KPI metrics, stock alerts, and recent scientific requisitions</small>
      </div>

      <app-loading-spinner [show]="isLoading" message="Loading administrative metrics from MongoDB..."></app-loading-spinner>

      <div *ngIf="!isLoading && data">
        <!-- Metric Cards Row -->
        <div class="row g-3 mb-4">
          <!-- Total Products -->
          <div class="col-6 col-md-4 col-xl-2">
            <div class="card scientific-card border p-3 h-100 shadow-sm">
              <span class="text-muted small text-uppercase fw-bold">Products</span>
              <h3 class="fw-bold text-navy my-1">{{ data.stats.totalProducts }}</h3>
              <small class="text-success"><i class="bi bi-check-circle"></i> {{ data.stats.activeProducts }} active</small>
            </div>
          </div>

          <!-- Total Revenue -->
          <div class="col-6 col-md-4 col-xl-2">
            <div class="card scientific-card border p-3 h-100 shadow-sm">
              <span class="text-muted small text-uppercase fw-bold">Paid Revenue</span>
              <h3 class="fw-bold text-success my-1">₹{{ data.stats.totalRevenue | number:'1.0-0' }}</h3>
              <small class="text-muted">Settled orders</small>
            </div>
          </div>

          <!-- Total Orders -->
          <div class="col-6 col-md-4 col-xl-2">
            <div class="card scientific-card border p-3 h-100 shadow-sm">
              <span class="text-muted small text-uppercase fw-bold">Total Orders</span>
              <h3 class="fw-bold text-dark my-1">{{ data.stats.totalOrders }}</h3>
              <small class="text-warning fw-semibold">{{ data.stats.pendingOrders }} pending</small>
            </div>
          </div>

          <!-- Total Users -->
          <div class="col-6 col-md-4 col-xl-2">
            <div class="card scientific-card border p-3 h-100 shadow-sm">
              <span class="text-muted small text-uppercase fw-bold">Customers</span>
              <h3 class="fw-bold text-navy my-1">{{ data.stats.totalUsers }}</h3>
              <small class="text-muted">Institutional accounts</small>
            </div>
          </div>

          <!-- Categories -->
          <div class="col-6 col-md-4 col-xl-2">
            <div class="card scientific-card border p-3 h-100 shadow-sm">
              <span class="text-muted small text-uppercase fw-bold">Categories</span>
              <h3 class="fw-bold text-navy my-1">{{ data.stats.totalCategories }}</h3>
              <small class="text-muted">Taxonomies</small>
            </div>
          </div>

          <!-- Enquiries -->
          <div class="col-6 col-md-4 col-xl-2">
            <div class="card scientific-card border p-3 h-100 shadow-sm">
              <span class="text-muted small text-uppercase fw-bold">Enquiries</span>
              <h3 class="fw-bold text-primary my-1">{{ data.stats.totalEnquiries }}</h3>
              <a routerLink="/admin/enquiries" class="small text-decoration-none">Manage enquiries &rarr;</a>
            </div>
          </div>

          <!-- Contact Messages -->
          <div class="col-6 col-md-4 col-xl-2">
            <div class="card scientific-card border p-3 h-100 shadow-sm">
              <span class="text-muted small text-uppercase fw-bold">Contact Msgs</span>
              <h3 class="fw-bold text-info my-1">{{ data.stats.totalContactMessages || 0 }}</h3>
              <a routerLink="/admin/contact-messages" class="small text-decoration-none">View messages &rarr;</a>
            </div>
          </div>
        </div>

        <!-- Section 2: Recent Orders & Low Stock Alerts -->
        <div class="row g-4 mb-4">
          <!-- Recent Orders -->
          <div class="col-12 col-xl-8">
            <div class="card scientific-card border shadow-sm p-4 h-100">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="fw-bold text-navy mb-0">Recent Chemical Requisitions</h5>
                <a routerLink="/admin/orders" class="btn btn-sm btn-outline-primary">View All Orders</a>
              </div>

              <div class="table-responsive-custom">
                <table class="scientific-table mb-0 small">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let ord of data.recentOrders">
                      <td class="fw-bold text-navy">{{ ord.orderNumber }}</td>
                      <td>{{ ord.shippingAddress?.fullName || 'Institutional Client' }}</td>
                      <td class="fw-bold">₹{{ ord.totalAmount | number:'1.2-2' }}</td>
                      <td>
                        <span class="badge" [ngClass]="ord.paymentStatus === 'Paid' ? 'bg-success' : 'bg-warning text-dark'">
                          {{ ord.paymentStatus }}
                        </span>
                      </td>
                      <td>
                        <span class="badge bg-primary">{{ ord.orderStatus }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Low Stock Products Alert -->
          <div class="col-12 col-xl-4">
            <div class="card scientific-card border shadow-sm p-4 h-100">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="fw-bold text-danger mb-0">
                  <i class="bi bi-exclamation-triangle-fill me-1"></i> Low Stock Alerts
                </h5>
                <a routerLink="/admin/products" class="btn btn-sm btn-outline-danger">Manage</a>
              </div>

              <div *ngIf="data.lowStockProducts.length === 0" class="text-center py-4 text-muted small">
                All chemical packings are sufficiently stocked.
              </div>

              <div *ngIf="data.lowStockProducts.length > 0" class="list-group list-group-flush" style="max-height: 320px; overflow-y: auto;">
                <div *ngFor="let prod of data.lowStockProducts" class="list-group-item px-0 py-2 border-bottom">
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <span class="fw-bold text-dark small d-block text-truncate" style="max-width: 200px;">
                        {{ prod.name }}
                      </span>
                      <span class="badge-cas" style="font-size: 0.68rem;">{{ prod.productCode }}</span>
                    </div>
                    <div class="text-end">
                      <span *ngFor="let p of getLowPackings(prod)" class="badge bg-danger d-block mb-1">
                        {{ p.size }}: {{ p.stock }} left
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 3: Recent Enquiries -->
        <div class="card scientific-card border shadow-sm p-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold text-navy mb-0">Recent Sourcing Inquiries</h5>
            <a routerLink="/admin/enquiries" class="btn btn-sm btn-outline-primary">Manage Enquiries</a>
          </div>

          <div class="table-responsive-custom">
            <table class="scientific-table mb-0 small">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Company</th>
                  <th>Chemical Requested</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let enq of data.recentEnquiries">
                  <td class="fw-semibold">{{ enq.customerName }}</td>
                  <td>{{ enq.companyName }}</td>
                  <td class="fw-bold text-navy">{{ enq.chemicalName }}</td>
                  <td>{{ enq.requiredQuantity }}</td>
                  <td>
                    <span class="badge" [ngClass]="{
                      'bg-warning text-dark': enq.status === 'New',
                      'bg-info text-dark': enq.status === 'Contacted',
                      'bg-success': enq.status === 'Resolved'
                    }">
                      {{ enq.status }}
                    </span>
                  </td>
                  <td class="text-muted">{{ enq.createdAt | date:'shortDate' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  data: any = null;
  isLoading: boolean = true;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.adminService.getDashboardStats().subscribe({
      next: (res) => {
        if (res.success) this.data = res.data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  getLowPackings(product: any) {
    if (!product.packings) return [];
    return product.packings.filter((p: any) => p.stock <= 10);
  }
}
