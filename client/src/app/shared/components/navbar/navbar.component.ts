import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <!-- Top Utility & Search Bar -->
    <header class="bg-white border-bottom py-2 shadow-sm sticky-top">
      <div class="container-fluid px-lg-5">
        <div class="row align-items-center gy-2">
          <!-- Logo & Brand -->
          <div class="col-12 col-md-3 col-lg-3">
            <a routerLink="/" class="d-flex align-items-center text-decoration-none text-navy">
              <div class="bg-navy text-white rounded p-2 me-2 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
                <i class="bi bi-radioactive fs-4 text-warning"></i>
              </div>
              <div>
                <span class="fs-4 fw-bold tracking-tight text-navy d-block lh-1">BRITI SCIENTIFIC</span>
                <small class="text-muted text-uppercase fw-semibold" style="font-size: 0.65rem; letter-spacing: 0.08em;">Chemicals & Standards</small>
              </div>
            </a>
          </div>

          <!-- Product Search Input -->
          <div class="col-12 col-md-5 col-lg-5">
            <form (ngSubmit)="onSearch()" class="input-group">
              <input
                type="text"
                class="form-control border-end-0 ps-3"
                placeholder="Search chemical name, CAS number, code (e.g. Charcoal, 7440-44-0)..."
                [(ngModel)]="searchQuery"
                name="searchQuery"
              />
              <button class="btn btn-outline-secondary border-start-0 bg-white text-primary" type="submit">
                <i class="bi bi-search"></i>
              </button>
            </form>
          </div>

          <!-- User Actions & Cart -->
          <div class="col-12 col-md-4 col-lg-4 d-flex justify-content-md-end align-items-center gap-3">
            <!-- Guest Links -->
            <div *ngIf="!currentUser" class="d-flex align-items-center gap-2">
              <a routerLink="/login" class="btn btn-sm btn-outline-primary fw-semibold">
                <i class="bi bi-box-arrow-in-right me-1"></i> Login
              </a>
              <a routerLink="/register" class="btn btn-sm btn-briti-primary">
                Register
              </a>
            </div>

            <!-- Authenticated User Dropdown -->
            <div *ngIf="currentUser" class="dropdown">
              <button
                class="btn btn-sm btn-outline-secondary dropdown-toggle d-flex align-items-center gap-2"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i class="bi bi-person-circle fs-5 text-primary"></i>
                <div class="text-start d-none d-sm-inline-block">
                  <span class="d-block fw-semibold text-dark small lh-1">{{ currentUser.fullName }}</span>
                  <span class="badge" [ngClass]="currentUser.role === 'ADMIN' ? 'bg-danger' : 'bg-primary'" style="font-size: 0.65rem;">
                    {{ currentUser.role }}
                  </span>
                </div>
              </button>
              <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0">
                <li *ngIf="currentUser.role === 'ADMIN'">
                  <a routerLink="/admin/dashboard" class="dropdown-item py-2 fw-semibold text-danger">
                    <i class="bi bi-speedometer2 me-2"></i> Admin Dashboard
                  </a>
                </li>
                <li><hr *ngIf="currentUser.role === 'ADMIN'" class="dropdown-divider"></li>
                <li>
                  <a routerLink="/profile" class="dropdown-item py-2">
                    <i class="bi bi-person-gear me-2"></i> My Profile
                  </a>
                </li>
                <li *ngIf="currentUser.role === 'USER'">
                  <a routerLink="/my-orders" class="dropdown-item py-2">
                    <i class="bi bi-box-seam me-2"></i> My Orders
                  </a>
                </li>
                <li *ngIf="currentUser.role === 'USER'">
                  <a routerLink="/enquiry" class="dropdown-item py-2">
                    <i class="bi bi-question-diamond me-2"></i> Chemical Enquiries
                  </a>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <button (click)="logout()" class="dropdown-item py-2 text-danger">
                    <i class="bi bi-power me-2"></i> Logout
                  </button>
                </li>
              </ul>
            </div>

            <!-- Cart Icon with Live Counter (for normal users / browsing) -->
            <a
              routerLink="/cart"
              class="btn btn-outline-primary position-relative d-flex align-items-center gap-1"
              title="View Cart"
            >
              <i class="bi bi-cart3 fs-5"></i>
              <span class="d-none d-lg-inline small fw-semibold">Cart</span>
              <span
                *ngIf="(cartCount$ | async) as count"
                class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
              >
                {{ count }}
              </span>
            </a>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Navigation Bar (ONE SINGLE NAVIGATION SYSTEM) -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-navy py-1 shadow-sm">
      <div class="container-fluid px-lg-5">
        <button
          class="navbar-toggler py-1"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#scientificNavbar"
          aria-controls="scientificNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="scientificNavbar">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0 fw-medium align-items-lg-center">
            <!-- 1. Home -->
            <li class="nav-item">
              <a
                routerLink="/"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{ exact: true }"
                class="nav-link px-2 px-xl-3"
              >
                <i class="bi bi-house-door me-1"></i> Home
              </a>
            </li>

            <!-- 2. About -->
            <li class="nav-item">
              <a routerLink="/about" routerLinkActive="active" class="nav-link px-2 px-xl-3">
                About
              </a>
            </li>

            <!-- 3. Products Catalog Dropdown -->
            <li class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle px-2 px-xl-3"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i class="bi bi-grid-3x3-gap me-1"></i> Products
              </a>
              <ul class="dropdown-menu shadow border-0 py-2" style="min-width: 280px; max-height: 400px; overflow-y: auto;">
                <li>
                  <a routerLink="/products" class="dropdown-item fw-bold text-navy py-2 border-bottom">
                    <i class="bi bi-collection me-2"></i> View All Products
                  </a>
                </li>
                <li *ngFor="let cat of categories">
                  <a [routerLink]="['/products']" [queryParams]="{ category: cat.name }" class="dropdown-item py-1 small">
                    <i class="bi bi-chevron-right text-muted me-1 small"></i> {{ cat.name }}
                  </a>
                </li>
              </ul>
            </li>

            <!-- 4. Resources -->
            <li class="nav-item">
              <a routerLink="/resources" routerLinkActive="active" class="nav-link px-2 px-xl-3">
                Resources
              </a>
            </li>

            <!-- ================= USER NAVIGATION (Role !== 'ADMIN') ================= -->
            <ng-container *ngIf="currentUser?.role !== 'ADMIN'">
              <!-- Contact -->
              <li class="nav-item">
                <a routerLink="/contact" routerLinkActive="active" class="nav-link px-2 px-xl-3">
                  <i class="bi bi-envelope me-1"></i> Contact
                </a>
              </li>

              <!-- Enquiry -->
              <li class="nav-item">
                <a routerLink="/enquiry" routerLinkActive="active" class="nav-link px-2 px-xl-3 text-warning">
                  <i class="bi bi-envelope-paper me-1"></i> Enquiry
                </a>
              </li>

              <!-- My Orders (for logged in USER) -->
              <li *ngIf="currentUser?.role === 'USER'" class="nav-item">
                <a routerLink="/my-orders" routerLinkActive="active" class="nav-link px-2 px-xl-3">
                  <i class="bi bi-box-seam me-1"></i> My Orders
                </a>
              </li>
            </ng-container>

            <!-- ================= ADMIN NAVIGATION (Role === 'ADMIN') ================= -->
            <ng-container *ngIf="currentUser?.role === 'ADMIN'">
              <!-- Separator for visual clarity -->
              <li class="nav-item d-none d-xl-block">
                <span class="text-white-50 px-1">|</span>
              </li>

              <!-- Dashboard -->
              <li class="nav-item">
                <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-link px-2 px-xl-3">
                  <i class="bi bi-speedometer2 me-1"></i> Dashboard
                </a>
              </li>

              <!-- Products Management -->
              <li class="nav-item">
                <a routerLink="/admin/products" routerLinkActive="active" class="nav-link px-2 px-xl-3">
                  <i class="bi bi-box-seam me-1"></i> Products Management
                </a>
              </li>

              <!-- Categories -->
              <li class="nav-item">
                <a routerLink="/admin/categories" routerLinkActive="active" class="nav-link px-2 px-xl-3">
                  <i class="bi bi-tags me-1"></i> Categories
                </a>
              </li>

              <!-- Orders -->
              <li class="nav-item">
                <a routerLink="/admin/orders" routerLinkActive="active" class="nav-link px-2 px-xl-3">
                  <i class="bi bi-cart-check me-1"></i> Orders
                </a>
              </li>

              <!-- Users -->
              <li class="nav-item">
                <a routerLink="/admin/users" routerLinkActive="active" class="nav-link px-2 px-xl-3">
                  <i class="bi bi-people me-1"></i> Users
                </a>
              </li>

              <!-- Enquiries -->
              <li class="nav-item">
                <a routerLink="/admin/enquiries" routerLinkActive="active" class="nav-link px-2 px-xl-3">
                  <i class="bi bi-envelope-paper me-1"></i> Enquiries
                </a>
              </li>

              <!-- Contact Messages -->
              <li class="nav-item">
                <a routerLink="/admin/contact-messages" routerLinkActive="active" class="nav-link px-2 px-xl-3 text-warning">
                  <i class="bi bi-chat-left-text me-1"></i> Contact Messages
                </a>
              </li>
            </ng-container>
          </ul>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .nav-link {
      transition: color 0.15s ease-in-out;
      font-size: 0.9rem;
      white-space: nowrap;
    }
    .nav-link.active {
      color: #38bdf8 !important;
      font-weight: 700;
    }
  `]
})
export class NavbarComponent implements OnInit {
  currentUser: User | null = null;
  categories: Category[] = [];
  searchQuery: string = '';
  cartCount$ = this.cartService.cartCount$;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      if (user) {
        this.cartService.getCart().subscribe({ error: () => {} });
      } else {
        this.cartService.resetLocalCart();
      }
    });

    this.categoryService.getCategories().subscribe({
      next: (res) => {
        if (res.success) {
          this.categories = res.data;
        }
      },
      error: () => {}
    });
  }

  onSearch() {
    if (this.searchQuery && this.searchQuery.trim() !== '') {
      this.router.navigate(['/products'], { queryParams: { search: this.searchQuery.trim() } });
    } else {
      this.router.navigate(['/products']);
    }
  }

  logout() {
    this.authService.logout();
  }
}
