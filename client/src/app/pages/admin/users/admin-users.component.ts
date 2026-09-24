import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { User } from '../../../core/models/user.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    ConfirmationDialogComponent
  ],
  template: `
    <div class="container-fluid px-lg-5 py-4">
      <div class="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 class="fw-bold text-navy mb-0">Institutional Customers & User Accounts</h2>
          <small class="text-muted">Inspect authorized user profiles, roles, and institutional affiliations</small>
        </div>
      </div>

      <app-loading-spinner [show]="isLoading" message="Loading users list..."></app-loading-spinner>

      <div *ngIf="!isLoading" class="card scientific-card border shadow-sm">
        <div class="table-responsive-custom">
          <table class="scientific-table mb-0">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Institutional Email</th>
                <th>Phone Number</th>
                <th>Company / Institute</th>
                <th>Role</th>
                <th>Registration Date</th>
                <th class="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let u of users">
                <td class="fw-bold text-navy">{{ u.fullName }}</td>
                <td class="font-monospace small">{{ u.email }}</td>
                <td class="small">{{ u.phone || '—' }}</td>
                <td class="small text-secondary">{{ u.companyName || '—' }}</td>
                <td>
                  <span class="badge" [ngClass]="u.role === 'ADMIN' ? 'bg-danger' : 'bg-primary'">
                    {{ u.role }}
                  </span>
                </td>
                <td class="small text-muted">{{ u.createdAt | date:'mediumDate' }}</td>
                <td class="text-end">
                  <button
                    class="btn btn-sm btn-outline-danger"
                    (click)="confirmDeleteUser(u)"
                    title="Delete User"
                    [disabled]="u.role === 'ADMIN' && countAdmins() <= 1"
                  >
                    <i class="bi bi-trash3"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- User Delete Confirmation Dialog -->
    <app-confirmation-dialog
      [isOpen]="showDeleteConfirm"
      title="Delete Customer Account"
      [message]="'Are you sure you want to delete user account for: ' + (targetUser?.fullName || '') + ' (' + (targetUser?.email || '') + ')?'"
      confirmText="Delete User"
      [isDanger]="true"
      (confirmed)="onDeleteConfirmed()"
      (cancelled)="showDeleteConfirm = false"
    ></app-confirmation-dialog>
  `
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  isLoading: boolean = true;

  showDeleteConfirm: boolean = false;
  targetUser: User | null = null;

  constructor(
    private adminService: AdminService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    this.adminService.getUsers().subscribe({
      next: (res) => {
        if (res.success) this.users = res.data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  countAdmins(): number {
    return this.users.filter((u) => u.role === 'ADMIN').length;
  }

  confirmDeleteUser(user: User) {
    this.targetUser = user;
    this.showDeleteConfirm = true;
  }

  onDeleteConfirmed() {
    if (!this.targetUser) return;
    this.showDeleteConfirm = false;

    this.adminService.deleteUser(this.targetUser._id).subscribe({
      next: () => {
        this.toastService.success(`User ${this.targetUser!.fullName} deleted.`);
        this.loadUsers();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to delete user.');
      }
    });
  }
}
