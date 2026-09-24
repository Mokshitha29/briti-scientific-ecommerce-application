import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../../core/services/toast.service';
import { Category } from '../../../core/models/category.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoadingSpinnerComponent,
    ConfirmationDialogComponent
  ],
  template: `
    <div class="container-fluid px-lg-5 py-4">
      <div class="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 class="fw-bold text-navy mb-0">Chemical Categories & Standards Taxonomy</h2>
          <small class="text-muted">Manage product grouping, specifications, and category visibility</small>
        </div>
        <button class="btn btn-briti-primary btn-sm" (click)="openCreateModal()">
          <i class="bi bi-plus-lg me-1"></i> Add Category
        </button>
      </div>

      <app-loading-spinner [show]="isLoading" message="Loading categories..."></app-loading-spinner>

      <div *ngIf="!isLoading" class="card scientific-card border shadow-sm">
        <div class="table-responsive-custom">
          <table class="scientific-table mb-0">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Description</th>
                <th>Status</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let cat of categories">
                <td class="fw-bold text-navy">{{ cat.name }}</td>
                <td class="text-secondary small">{{ cat.description || 'No description provided' }}</td>
                <td>
                  <span class="badge" [ngClass]="cat.isActive ? 'bg-success' : 'bg-secondary'">
                    {{ cat.isActive ? 'Active' : 'Hidden' }}
                  </span>
                </td>
                <td class="text-end">
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-secondary" (click)="openEditModal(cat)" title="Edit Category">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger" (click)="confirmDelete(cat)" title="Delete Category">
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

    <!-- Category Modal -->
    <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);" *ngIf="showModal">
      <div class="modal-dialog">
        <div class="modal-content shadow border-0">
          <div class="modal-header bg-navy text-white">
            <h5 class="modal-title fw-bold">
              {{ isEditing ? 'Edit Category' : 'Create Category' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" (click)="closeModal()"></button>
          </div>
          <div class="modal-body p-4">
            <div class="mb-3">
              <label class="form-label small fw-bold">Category Name *</label>
              <input type="text" class="form-control" [(ngModel)]="currentName" placeholder="e.g. Bio-Chemical Reagents" />
            </div>
            <div class="mb-3">
              <label class="form-label small fw-bold">Description</label>
              <textarea class="form-control" rows="3" [(ngModel)]="currentDescription" placeholder="Overview of chemicals in this category..."></textarea>
            </div>
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" id="catActive" [(ngModel)]="currentIsActive" />
              <label class="form-check-label small fw-semibold" for="catActive">Category Active in Catalog</label>
            </div>
          </div>
          <div class="modal-footer bg-light">
            <button type="button" class="btn btn-outline-secondary" (click)="closeModal()">Cancel</button>
            <button type="button" class="btn btn-briti-primary" (click)="saveCategory()" [disabled]="!currentName.trim()">
              {{ isEditing ? 'Save Changes' : 'Create' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Dialog -->
    <app-confirmation-dialog
      [isOpen]="showDeleteConfirm"
      title="Delete Category"
      [message]="'Are you sure you want to delete category: ' + (targetCategory?.name || '') + '? Note that categories with linked products cannot be deleted.'"
      confirmText="Delete Category"
      [isDanger]="true"
      (confirmed)="onDeleteConfirmed()"
      (cancelled)="showDeleteConfirm = false"
    ></app-confirmation-dialog>
  `
})
export class AdminCategoriesComponent implements OnInit {
  categories: Category[] = [];
  isLoading: boolean = true;

  showModal: boolean = false;
  isEditing: boolean = false;
  editCategoryId: string = '';
  currentName: string = '';
  currentDescription: string = '';
  currentIsActive: boolean = true;

  showDeleteConfirm: boolean = false;
  targetCategory: Category | null = null;

  constructor(
    private categoryService: CategoryService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.isLoading = true;
    this.categoryService.getCategories(true).subscribe({
      next: (res) => {
        if (res.success) this.categories = res.data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  openCreateModal() {
    this.isEditing = false;
    this.editCategoryId = '';
    this.currentName = '';
    this.currentDescription = '';
    this.currentIsActive = true;
    this.showModal = true;
  }

  openEditModal(category: Category) {
    this.isEditing = true;
    this.editCategoryId = category._id;
    this.currentName = category.name;
    this.currentDescription = category.description || '';
    this.currentIsActive = category.isActive;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  saveCategory() {
    if (!this.currentName.trim()) return;

    const payload = {
      name: this.currentName.trim(),
      description: this.currentDescription.trim(),
      isActive: this.currentIsActive
    };

    if (this.isEditing) {
      this.categoryService.updateCategory(this.editCategoryId, payload).subscribe({
        next: () => {
          this.toastService.success('Category updated successfully.');
          this.closeModal();
          this.loadCategories();
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Failed to update category.');
        }
      });
    } else {
      this.categoryService.createCategory(payload).subscribe({
        next: () => {
          this.toastService.success('Category created successfully.');
          this.closeModal();
          this.loadCategories();
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Failed to create category.');
        }
      });
    }
  }

  confirmDelete(cat: Category) {
    this.targetCategory = cat;
    this.showDeleteConfirm = true;
  }

  onDeleteConfirmed() {
    if (!this.targetCategory) return;
    this.showDeleteConfirm = false;

    this.categoryService.deleteCategory(this.targetCategory._id).subscribe({
      next: () => {
        this.toastService.success('Category deleted successfully.');
        this.loadCategories();
      },
      error: (err) => {
        // Displays safe deletion refusal message if products are associated
        this.toastService.error(err.error?.message || 'Cannot delete category.');
      }
    });
  }
}
