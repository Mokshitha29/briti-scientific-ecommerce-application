import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { Product } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ProductCardComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="container-fluid px-lg-5 py-4">
      <!-- Breadcrumb -->
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb scientific-breadcrumb">
          <li class="breadcrumb-item"><a routerLink="/">Home</a></li>
          <li class="breadcrumb-item active" aria-current="page">Chemical Catalog</li>
        </ol>
      </nav>

      <!-- Page Title & Header -->
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 class="fw-bold text-navy mb-1">Scientific Products Catalog</h2>
          <p class="text-muted small mb-0">High-purity reagents, certified standards, and analytical grade chemicals</p>
        </div>
        <div class="d-flex align-items-center gap-2 mt-2 mt-md-0">
          <!-- View Toggle -->
          <div class="btn-group" role="group">
            <button
              type="button"
              class="btn btn-sm"
              [ngClass]="viewMode === 'card' ? 'btn-primary' : 'btn-outline-secondary'"
              (click)="viewMode = 'card'"
              title="Card Grid View"
            >
              <i class="bi bi-grid-fill"></i> Grid
            </button>
            <button
              type="button"
              class="btn btn-sm"
              [ngClass]="viewMode === 'table' ? 'btn-primary' : 'btn-outline-secondary'"
              (click)="viewMode = 'table'"
              title="Specification Table View"
            >
              <i class="bi bi-table"></i> Table
            </button>
          </div>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="card scientific-card border p-3 mb-4">
        <div class="row g-3 align-items-center">
          <!-- Search Box -->
          <div class="col-12 col-md-4 col-lg-3">
            <label class="form-label small fw-bold text-muted mb-1">Search Keywords</label>
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
              <input
                type="text"
                class="form-control"
                placeholder="Product name, CAS, code..."
                [(ngModel)]="search"
                (keyup.enter)="applyFilters()"
              />
            </div>
          </div>

          <!-- Category Filter -->
          <div class="col-6 col-md-3 col-lg-3">
            <label class="form-label small fw-bold text-muted mb-1">Category</label>
            <select class="form-select form-select-sm" [(ngModel)]="selectedCategory" (change)="applyFilters()">
              <option value="">All Categories</option>
              <option *ngFor="let cat of categories" [value]="cat.name">{{ cat.name }}</option>
            </select>
          </div>

          <!-- Purity Filter -->
          <div class="col-6 col-md-2 col-lg-2">
            <label class="form-label small fw-bold text-muted mb-1">Purity Grade</label>
            <select class="form-select form-select-sm" [(ngModel)]="selectedPurity" (change)="applyFilters()">
              <option value="">All Grades</option>
              <option value="AR">AR (Analytical Reagent)</option>
              <option value="HPLC">HPLC Grade</option>
              <option value="LC-MS">LC-MS Ultra Pure</option>
              <option value="Trace Metal">Trace Metal Grade</option>
              <option value="Standard">Reference Standard</option>
            </select>
          </div>

          <!-- Stock Filter -->
          <div class="col-6 col-md-2 col-lg-2">
            <label class="form-label small fw-bold text-muted mb-1">Availability</label>
            <select class="form-select form-select-sm" [(ngModel)]="selectedStock" (change)="applyFilters()">
              <option value="">All Stock</option>
              <option value="in_stock">In Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>

          <!-- Sort Filter -->
          <div class="col-6 col-md-2 col-lg-2">
            <label class="form-label small fw-bold text-muted mb-1">Sort By</label>
            <select class="form-select form-select-sm" [(ngModel)]="selectedSort" (change)="applyFilters()">
              <option value="newest">Newest Arrivals</option>
              <option value="name_asc">Name (A - Z)</option>
              <option value="name_desc">Name (Z - A)</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div class="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
          <small class="text-muted">
            Showing <span class="fw-bold text-dark">{{ totalProducts }}</span> products matching your criteria
          </small>
          <button *ngIf="hasActiveFilters" (click)="resetFilters()" class="btn btn-sm btn-link text-danger p-0 text-decoration-none">
            <i class="bi bi-x-circle"></i> Clear Filters
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <app-loading-spinner [show]="isLoading" message="Fetching chemicals matching filters..."></app-loading-spinner>

      <!-- Empty State -->
      <app-empty-state
        *ngIf="!isLoading && products.length === 0"
        title="No chemicals match your criteria"
        description="Try clearing your search query or relaxing category and purity grade filters."
        actionText="Reset All Filters"
        (actionClick)="resetFilters()"
      ></app-empty-state>

      <!-- View 1: Card Grid View -->
      <div *ngIf="!isLoading && products.length > 0 && viewMode === 'card'" class="row g-4 mb-4">
        <div *ngFor="let product of products" class="col-12 col-sm-6 col-md-4 col-lg-3">
          <app-product-card [product]="product" (addToCart)="onAddToCart($event)"></app-product-card>
        </div>
      </div>

      <!-- View 2: Specification Table View -->
      <div *ngIf="!isLoading && products.length > 0 && viewMode === 'table'" class="table-responsive-custom mb-4">
        <table class="scientific-table shadow-sm">
          <thead>
            <tr>
              <th>Product Code</th>
              <th>Chemical Name</th>
              <th>CAS Number</th>
              <th>Purity</th>
              <th>Category</th>
              <th>Available Packings</th>
              <th>Starting Price</th>
              <th>Stock Status</th>
              <th class="text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let prod of products">
              <td class="fw-bold text-navy">{{ prod.productCode }}</td>
              <td>
                <a [routerLink]="['/products', prod._id]" class="fw-semibold text-dark text-decoration-none">
                  {{ prod.name }}
                </a>
              </td>
              <td>
                <span class="badge-cas">{{ prod.casNumber }}</span>
              </td>
              <td>
                <span class="badge-purity">{{ prod.purity }}</span>
              </td>
              <td class="small text-muted">{{ getCategoryName(prod) }}</td>
              <td>
                <div class="d-flex flex-wrap gap-1">
                  <span *ngFor="let p of prod.packings" class="badge bg-light text-dark border">
                    {{ p.size }}
                  </span>
                </div>
              </td>
              <td class="fw-bold text-dark">
                ₹{{ getLowestPrice(prod) | number:'1.2-2' }}
              </td>
              <td>
                <span *ngIf="getTotalStock(prod) > 10" class="badge-stock-in">In Stock</span>
                <span *ngIf="getTotalStock(prod) > 0 && getTotalStock(prod) <= 10" class="badge-stock-low">Low Stock</span>
                <span *ngIf="getTotalStock(prod) <= 0" class="badge-stock-out">Out of Stock</span>
              </td>
              <td class="text-end">
                <a [routerLink]="['/products', prod._id]" class="btn btn-sm btn-briti-primary">
                  View
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Controls -->
      <nav *ngIf="!isLoading && totalPages > 1" class="d-flex justify-content-center mt-4">
        <ul class="pagination pagination-sm">
          <li class="page-item" [class.disabled]="currentPage === 1">
            <button class="page-link" (click)="goToPage(currentPage - 1)">Previous</button>
          </li>
          <li
            *ngFor="let pageNum of [].constructor(totalPages); let i = index"
            class="page-item"
            [class.active]="currentPage === i + 1"
          >
            <button class="page-link" (click)="goToPage(i + 1)">{{ i + 1 }}</button>
          </li>
          <li class="page-item" [class.disabled]="currentPage === totalPages">
            <button class="page-link" (click)="goToPage(currentPage + 1)">Next</button>
          </li>
        </ul>
      </nav>
    </div>
  `
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  isLoading: boolean = true;
  viewMode: 'card' | 'table' = 'card';

  // Filters
  search: string = '';
  selectedCategory: string = '';
  selectedPurity: string = '';
  selectedStock: string = '';
  selectedSort: string = 'newest';

  // Pagination
  currentPage: number = 1;
  pageSize: number = 12;
  totalProducts: number = 0;
  totalPages: number = 1;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private cartService: CartService,
    private authService: AuthService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  get hasActiveFilters(): boolean {
    return !!(this.search || this.selectedCategory || this.selectedPurity || this.selectedStock || this.selectedSort !== 'newest');
  }

  ngOnInit() {
    this.categoryService.getCategories().subscribe({
      next: (res) => {
        if (res.success) this.categories = res.data;
      }
    });

    this.route.queryParams.subscribe((params) => {
      this.search = params['search'] || '';
      this.selectedCategory = params['category'] || '';
      this.selectedPurity = params['purity'] || '';
      this.selectedStock = params['stock'] || '';
      this.selectedSort = params['sort'] || 'newest';
      this.currentPage = parseInt(params['page'], 10) || 1;
      this.fetchProducts();
    });
  }

  fetchProducts() {
    this.isLoading = true;
    const query: any = {
      page: this.currentPage,
      limit: this.pageSize,
      sort: this.selectedSort
    };

    if (this.search) query.search = this.search;
    if (this.selectedCategory) query.category = this.selectedCategory;
    if (this.selectedPurity) query.purity = this.selectedPurity;
    if (this.selectedStock) query.stock = this.selectedStock;

    this.productService.getProducts(query).subscribe({
      next: (res) => {
        if (res.success) {
          this.products = res.data;
          this.totalProducts = res.pagination.total;
          this.totalPages = res.pagination.totalPages;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: this.search || null,
        category: this.selectedCategory || null,
        purity: this.selectedPurity || null,
        stock: this.selectedStock || null,
        sort: this.selectedSort !== 'newest' ? this.selectedSort : null,
        page: 1
      },
      queryParamsHandling: 'merge'
    });
  }

  resetFilters() {
    this.search = '';
    this.selectedCategory = '';
    this.selectedPurity = '';
    this.selectedStock = '';
    this.selectedSort = 'newest';
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {}
    });
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page },
      queryParamsHandling: 'merge'
    });
  }

  getLowestPrice(product: Product): number {
    if (!product.packings || product.packings.length === 0) return 0;
    return Math.min(...product.packings.map((p) => p.price));
  }

  getTotalStock(product: Product): number {
    if (!product.packings || product.packings.length === 0) return 0;
    return product.packings.reduce((sum, p) => sum + (p.stock || 0), 0);
  }

  getCategoryName(product: Product): string {
    if (!product.category) return 'Chemicals';
    if (typeof product.category === 'object' && 'name' in product.category) {
      return product.category.name;
    }
    return String(product.category);
  }

  onAddToCart(event: { productId: string; packingSize: string; quantity: number }) {
    if (!this.authService.isLoggedIn()) {
      this.toastService.info('Please log in to add items to your cart.');
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/products' } });
      return;
    }

    this.cartService.addToCart(event.productId, event.packingSize, event.quantity).subscribe({
      next: (res) => {
        this.toastService.success(res.message || 'Added to cart successfully.');
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Could not add item to cart.');
      }
    });
  }
}
