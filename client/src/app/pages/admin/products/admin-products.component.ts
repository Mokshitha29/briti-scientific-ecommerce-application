import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../core/services/toast.service';
import { Product, Packing } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    LoadingSpinnerComponent,
    ConfirmationDialogComponent
  ],
  template: `
    <div class="container-fluid px-lg-5 py-4">
      <div class="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 class="fw-bold text-navy mb-0">Chemical Products Management</h2>
          <small class="text-muted">Create, edit, adjust stock, and configure multi-packing specifications</small>
        </div>
        <button class="btn btn-briti-primary btn-sm" (click)="openCreateModal()">
          <i class="bi bi-plus-lg me-1"></i> Add Chemical Product
        </button>
      </div>

      <!-- Search & Filter Bar -->
      <div class="card scientific-card border p-3 mb-4">
        <div class="row g-2 align-items-center">
          <div class="col-12 col-md-5">
            <input
              type="text"
              class="form-control form-control-sm"
              placeholder="Search product code, name, or CAS..."
              [(ngModel)]="searchTerm"
              (input)="filterProducts()"
            />
          </div>
          <div class="col-6 col-md-4">
            <select class="form-select form-select-sm" [(ngModel)]="selectedCategory" (change)="filterProducts()">
              <option value="">All Categories</option>
              <option *ngFor="let cat of categories" [value]="cat._id">{{ cat.name }}</option>
            </select>
          </div>
          <div class="col-6 col-md-3 text-end">
            <small class="text-muted">Total: <strong>{{ filteredProducts.length }}</strong> products</small>
          </div>
        </div>
      </div>

      <app-loading-spinner [show]="isLoading" message="Fetching product database..."></app-loading-spinner>

      <!-- Products Table -->
      <div *ngIf="!isLoading" class="card scientific-card border shadow-sm">
        <div class="table-responsive-custom">
          <table class="scientific-table mb-0">
            <thead>
              <tr>
                <th>Code</th>
                <th>Product Name</th>
                <th>CAS Number</th>
                <th>Purity</th>
                <th>Category</th>
                <th>Packings (Size | Price | Stock)</th>
                <th>Status</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let prod of filteredProducts">
                <td class="fw-bold text-navy">{{ prod.productCode }}</td>
                <td>
                  <span class="fw-bold text-dark d-block">{{ prod.name }}</span>
                  <small class="text-muted">HSN: {{ prod.hsnCode }} • GST: {{ prod.gst }}%</small>
                </td>
                <td><span class="badge-cas">{{ prod.casNumber }}</span></td>
                <td><span class="badge-purity">{{ prod.purity }}</span></td>
                <td class="small">{{ getCategoryName(prod) }}</td>
                <td>
                  <div class="d-flex flex-wrap gap-1">
                    <span *ngFor="let pack of prod.packings" class="badge border" [ngClass]="pack.stock > 0 ? 'bg-light text-dark' : 'bg-danger text-white'">
                      {{ pack.size }}: ₹{{ pack.price }} (Qty: {{ pack.stock }})
                    </span>
                  </div>
                </td>
                <td>
                  <span class="badge" [ngClass]="prod.isActive ? 'bg-success' : 'bg-secondary'">
                    {{ prod.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="text-end">
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-secondary" (click)="openEditModal(prod)" title="Edit Product">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger" (click)="confirmDelete(prod)" title="Delete Product">
                      <i class="bi bi-trash3"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Product Create/Edit Modal -->
    <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);" *ngIf="showModal">
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content shadow border-0">
          <div class="modal-header bg-navy text-white">
            <h5 class="modal-title fw-bold">
              {{ isEditing ? 'Edit Chemical Product' : 'Add New Chemical Product' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" (click)="closeModal()"></button>
          </div>
          <div class="modal-body p-4">
            <form [formGroup]="productForm">
              <div class="row g-3 mb-3">
                <div class="col-12 col-md-4">
                  <label class="form-label small fw-bold">Product Code *</label>
                  <input type="text" class="form-control" formControlName="productCode" placeholder="BS10025" />
                </div>
                <div class="col-12 col-md-8">
                  <label class="form-label small fw-bold">Product Name *</label>
                  <input type="text" class="form-control" formControlName="name" placeholder="Acetone HPLC Grade" />
                </div>
              </div>

              <div class="row g-3 mb-3">
                <div class="col-12 col-md-4">
                  <label class="form-label small fw-bold">CAS Number *</label>
                  <input type="text" class="form-control font-monospace" formControlName="casNumber" placeholder="67-64-1" />
                </div>
                <div class="col-12 col-md-4">
                  <label class="form-label small fw-bold">Purity Grade *</label>
                  <input type="text" class="form-control" formControlName="purity" placeholder="AR or ≥ 99.8%" />
                </div>
                <div class="col-12 col-md-4">
                  <label class="form-label small fw-bold">Category *</label>
                  <select class="form-select" formControlName="category">
                    <option value="">Select Category</option>
                    <option *ngFor="let cat of categories" [value]="cat._id">{{ cat.name }}</option>
                  </select>
                </div>
              </div>

              <div class="row g-3 mb-3">
                <div class="col-12 col-md-4">
                  <label class="form-label small fw-bold">HSN Code *</label>
                  <input type="text" class="form-control" formControlName="hsnCode" placeholder="29141100" />
                </div>
                <div class="col-12 col-md-4">
                  <label class="form-label small fw-bold">GST Percentage *</label>
                  <input type="number" class="form-control" formControlName="gst" placeholder="18" />
                </div>
                <div class="col-12 col-md-4">
                  <label class="form-label small fw-bold">Status</label>
                  <select class="form-select" formControlName="isActive">
                    <option [ngValue]="true">Active (Visible)</option>
                    <option [ngValue]="false">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-bold">Image URL</label>
                <input type="text" class="form-control" formControlName="image" placeholder="https://..." />
              </div>

              <div class="mb-3">
                <label class="form-label small fw-bold">Description / Technical Notes</label>
                <textarea class="form-control" rows="2" formControlName="description"></textarea>
              </div>

              <!-- Dynamic Packings Section -->
              <div class="border rounded p-3 bg-light mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="fw-bold small text-navy">Packing Sizes, Prices & Inventory *</span>
                  <button type="button" class="btn btn-sm btn-outline-primary" (click)="addPackingRow()">
                    <i class="bi bi-plus"></i> Add Packing
                  </button>
                </div>

                <div formArrayName="packings">
                  <div *ngFor="let p of packingsFormArray.controls; let i = index" [formGroupName]="i" class="row g-2 align-items-center mb-2">
                    <div class="col-4">
                      <input type="text" class="form-control form-control-sm" placeholder="Size (e.g. 500 mL, 1 kg)" formControlName="size" />
                    </div>
                    <div class="col-3">
                      <div class="input-group input-group-sm">
                        <span class="input-group-text">₹</span>
                        <input type="number" class="form-control" placeholder="Price" formControlName="price" />
                      </div>
                    </div>
                    <div class="col-3">
                      <input type="number" class="form-control form-control-sm" placeholder="Stock Qty" formControlName="stock" />
                    </div>
                    <div class="col-2 text-end">
                      <button
                        type="button"
                        class="btn btn-sm btn-outline-danger"
                        (click)="removePackingRow(i)"
                        [disabled]="packingsFormArray.length <= 1"
                      >
                        <i class="bi bi-x-lg"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer bg-light">
            <button type="button" class="btn btn-outline-secondary" (click)="closeModal()">Cancel</button>
            <button
              type="button"
              class="btn btn-briti-primary"
              [disabled]="productForm.invalid || isSaving"
              (click)="saveProduct()"
            >
              <span *ngIf="isSaving" class="spinner-border spinner-border-sm me-1"></span>
              {{ isEditing ? 'Save Changes' : 'Create Product' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <app-confirmation-dialog
      [isOpen]="showDeleteConfirm"
      title="Delete Product"
      [message]="'Are you sure you want to delete ' + (targetProduct?.name || '') + ' (' + (targetProduct?.productCode || '') + ')? This action cannot be undone.'"
      confirmText="Yes, Delete Product"
      [isDanger]="true"
      (confirmed)="onDeleteConfirmed()"
      (cancelled)="showDeleteConfirm = false"
    ></app-confirmation-dialog>
  `
})
export class AdminProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  isLoading: boolean = true;
  isSaving: boolean = false;

  searchTerm: string = '';
  selectedCategory: string = '';

  showModal: boolean = false;
  isEditing: boolean = false;
  editProductId: string = '';
  productForm!: FormGroup;

  showDeleteConfirm: boolean = false;
  targetProduct: Product | null = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService,
    private toastService: ToastService
  ) {}

  get packingsFormArray(): FormArray {
    return this.productForm.get('packings') as FormArray;
  }

  ngOnInit() {
    this.initForm();
    this.loadCategories();
    this.loadProducts();
  }

  initForm() {
    this.productForm = this.fb.group({
      productCode: ['', Validators.required],
      name: ['', Validators.required],
      casNumber: ['', Validators.required],
      category: ['', Validators.required],
      purity: ['AR', Validators.required],
      hsnCode: ['38029019', Validators.required],
      gst: [18, Validators.required],
      image: [''],
      description: [''],
      isActive: [true],
      packings: this.fb.array([])
    });
  }

  createPackingGroup(size = '', price = 0, stock = 10): FormGroup {
    return this.fb.group({
      size: [size, Validators.required],
      price: [price, [Validators.required, Validators.min(0)]],
      stock: [stock, [Validators.required, Validators.min(0)]]
    });
  }

  addPackingRow(size = '', price = 0, stock = 10) {
    this.packingsFormArray.push(this.createPackingGroup(size, price, stock));
  }

  removePackingRow(index: number) {
    if (this.packingsFormArray.length > 1) {
      this.packingsFormArray.removeAt(index);
    }
  }

  loadCategories() {
    this.categoryService.getCategories(true).subscribe({
      next: (res) => {
        if (res.success) this.categories = res.data;
      }
    });
  }

  loadProducts() {
    this.isLoading = true;
    this.productService.getProducts({ all: 'true', limit: 100 }).subscribe({
      next: (res) => {
        if (res.success) {
          this.products = res.data;
          this.filterProducts();
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  filterProducts() {
    this.filteredProducts = this.products.filter((p) => {
      const matchesSearch =
        !this.searchTerm ||
        p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.productCode.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.casNumber.toLowerCase().includes(this.searchTerm.toLowerCase());

      const catId = typeof p.category === 'object' ? (p.category as any)._id : p.category;
      const matchesCat = !this.selectedCategory || catId === this.selectedCategory;

      return matchesSearch && matchesCat;
    });
  }

  getCategoryName(prod: Product): string {
    if (!prod.category) return 'N/A';
    if (typeof prod.category === 'object' && 'name' in prod.category) {
      return prod.category.name;
    }
    const found = this.categories.find((c) => c._id === prod.category);
    return found ? found.name : 'Unknown';
  }

  openCreateModal() {
    this.isEditing = false;
    this.editProductId = '';
    this.productForm.reset({
      productCode: '',
      name: '',
      casNumber: '',
      category: this.categories[0]?._id || '',
      purity: 'AR',
      hsnCode: '38029019',
      gst: 18,
      image: '',
      description: '',
      isActive: true
    });
    this.packingsFormArray.clear();
    this.addPackingRow('500 mL', 500, 15);
    this.showModal = true;
  }

  openEditModal(product: Product) {
    this.isEditing = true;
    this.editProductId = product._id;
    const catId = typeof product.category === 'object' ? (product.category as any)._id : product.category;

    this.productForm.patchValue({
      productCode: product.productCode,
      name: product.name,
      casNumber: product.casNumber,
      category: catId,
      purity: product.purity,
      hsnCode: product.hsnCode,
      gst: product.gst,
      image: product.image,
      description: product.description,
      isActive: product.isActive
    });

    this.packingsFormArray.clear();
    if (product.packings && product.packings.length > 0) {
      product.packings.forEach((pack) => {
        this.addPackingRow(pack.size, pack.price, pack.stock);
      });
    } else {
      this.addPackingRow('500 mL', 500, 10);
    }

    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveProduct() {
    if (this.productForm.invalid) return;

    this.isSaving = true;
    const formVal = this.productForm.value;

    if (this.isEditing) {
      this.productService.updateProduct(this.editProductId, formVal).subscribe({
        next: (res) => {
          this.isSaving = false;
          this.toastService.success('Chemical product updated successfully.');
          this.closeModal();
          this.loadProducts();
        },
        error: (err) => {
          this.isSaving = false;
          this.toastService.error(err.error?.message || 'Failed to update product.');
        }
      });
    } else {
      this.productService.createProduct(formVal).subscribe({
        next: (res) => {
          this.isSaving = false;
          this.toastService.success('Chemical product created successfully.');
          this.closeModal();
          this.loadProducts();
        },
        error: (err) => {
          this.isSaving = false;
          this.toastService.error(err.error?.message || 'Failed to create product.');
        }
      });
    }
  }

  confirmDelete(product: Product) {
    this.targetProduct = product;
    this.showDeleteConfirm = true;
  }

  onDeleteConfirmed() {
    if (!this.targetProduct) return;
    this.showDeleteConfirm = false;

    this.productService.deleteProduct(this.targetProduct._id).subscribe({
      next: () => {
        this.toastService.success(`Product ${this.targetProduct!.name} deleted.`);
        this.loadProducts();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to delete product.');
      }
    });
  }
}
