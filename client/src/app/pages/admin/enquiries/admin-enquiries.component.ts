import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { Enquiry } from '../../../core/models/enquiry.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-admin-enquiries',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="container-fluid px-lg-5 py-4">
      <div class="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 class="fw-bold text-navy mb-0">Chemical Sourcing & Bulk Inquiries Desk</h2>
          <small class="text-muted">Manage institution inquiries, custom synthesis leads, and customer follow-ups</small>
        </div>
      </div>

      <!-- Filters -->
      <div class="card scientific-card border p-3 mb-4">
        <div class="row g-2 align-items-center">
          <div class="col-12 col-md-4">
            <select class="form-select form-select-sm" [(ngModel)]="selectedStatus" (change)="loadEnquiries()">
              <option value="">All Inquiry Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
          <div class="col-12 col-md-8 text-md-end">
            <small class="text-muted">Total: <strong>{{ enquiries.length }}</strong> inquiries</small>
          </div>
        </div>
      </div>

      <app-loading-spinner [show]="isLoading" message="Fetching enquiries..."></app-loading-spinner>

      <div *ngIf="!isLoading" class="card scientific-card border shadow-sm">
        <div class="table-responsive-custom">
          <table class="scientific-table mb-0">
            <thead>
              <tr>
                <th>Customer / Company</th>
                <th>Chemical Requested</th>
                <th>CAS #</th>
                <th>Required Qty</th>
                <th>Contact Coordinates</th>
                <th>Status</th>
                <th class="text-end">Manage</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let enq of enquiries">
                <td>
                  <strong class="text-navy d-block">{{ enq.customerName }}</strong>
                  <small class="text-muted">{{ enq.companyName }}</small>
                </td>
                <td>
                  <span class="fw-bold text-dark d-block">{{ enq.chemicalName }}</span>
                  <small class="text-muted text-truncate d-inline-block" style="max-width: 250px;">{{ enq.message }}</small>
                </td>
                <td><span class="badge-cas">{{ enq.casNumber || 'N/A' }}</span></td>
                <td>{{ enq.requiredQuantity }}</td>
                <td class="small">
                  <div class="font-monospace">{{ enq.officialEmail }}</div>
                  <div class="text-muted">{{ enq.phone }}</div>
                </td>
                <td>
                  <span class="badge" [ngClass]="{
                    'bg-warning text-dark': enq.status === 'New',
                    'bg-info text-dark': enq.status === 'Contacted',
                    'bg-success': enq.status === 'Resolved'
                  }">
                    {{ enq.status }}
                  </span>
                </td>
                <td class="text-end">
                  <button class="btn btn-sm btn-outline-primary" (click)="openDetailModal(enq)">
                    <i class="bi bi-eye me-1"></i> View / Update
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Enquiry Details & Status Update Modal -->
    <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);" *ngIf="showModal && selectedEnquiry">
      <div class="modal-dialog modal-lg">
        <div class="modal-content shadow border-0">
          <div class="modal-header bg-navy text-white">
            <h5 class="modal-title fw-bold">Inquiry Details: {{ selectedEnquiry.chemicalName }}</h5>
            <button type="button" class="btn-close btn-close-white" (click)="showModal = false"></button>
          </div>
          <div class="modal-body p-4">
            <div class="row g-3 mb-3">
              <div class="col-6">
                <small class="text-muted d-block">Client Name:</small>
                <strong class="text-dark">{{ selectedEnquiry.customerName }}</strong>
              </div>
              <div class="col-6">
                <small class="text-muted d-block">Institution:</small>
                <strong class="text-dark">{{ selectedEnquiry.companyName }}</strong>
              </div>
              <div class="col-6">
                <small class="text-muted d-block">Email:</small>
                <strong class="font-monospace text-primary">{{ selectedEnquiry.officialEmail }}</strong>
              </div>
              <div class="col-6">
                <small class="text-muted d-block">Phone:</small>
                <strong class="text-dark">{{ selectedEnquiry.phone }}</strong>
              </div>
            </div>

            <div class="p-3 bg-light rounded border mb-3">
              <div class="d-flex justify-content-between mb-2">
                <span><strong>Target Chemical:</strong> {{ selectedEnquiry.chemicalName }}</span>
                <span><strong>CAS:</strong> {{ selectedEnquiry.casNumber || 'N/A' }}</span>
              </div>
              <div><strong>Quantity:</strong> {{ selectedEnquiry.requiredQuantity }}</div>
              <hr class="my-2" />
              <div><strong>Technical Message:</strong></div>
              <p class="mb-0 text-secondary mt-1 lh-base">{{ selectedEnquiry.message }}</p>
            </div>

            <div>
              <label class="form-label small fw-bold text-dark">Update Follow-up Status</label>
              <select class="form-select" [(ngModel)]="newStatus">
                <option value="New">New (Unreviewed)</option>
                <option value="Contacted">Contacted (Quotation Sent)</option>
                <option value="Resolved">Resolved (Completed / Closed)</option>
              </select>
            </div>
          </div>
          <div class="modal-footer bg-light">
            <button type="button" class="btn btn-outline-secondary" (click)="showModal = false">Close</button>
            <button type="button" class="btn btn-briti-primary" (click)="saveStatus()">Update Status</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminEnquiriesComponent implements OnInit {
  enquiries: Enquiry[] = [];
  isLoading: boolean = true;
  selectedStatus: string = '';

  showModal: boolean = false;
  selectedEnquiry: Enquiry | null = null;
  newStatus: string = 'New';

  constructor(
    private adminService: AdminService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadEnquiries();
  }

  loadEnquiries() {
    this.isLoading = true;
    const filter: any = {};
    if (this.selectedStatus) filter.status = this.selectedStatus;

    this.adminService.getEnquiries(filter).subscribe({
      next: (res) => {
        if (res.success) this.enquiries = res.data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  openDetailModal(enquiry: Enquiry) {
    this.selectedEnquiry = enquiry;
    this.newStatus = enquiry.status;
    this.showModal = true;
  }

  saveStatus() {
    if (!this.selectedEnquiry || !this.selectedEnquiry._id) return;

    this.adminService.updateEnquiryStatus(this.selectedEnquiry._id, this.newStatus).subscribe({
      next: () => {
        this.toastService.success(`Inquiry status updated to ${this.newStatus}.`);
        this.showModal = false;
        this.loadEnquiries();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to update enquiry status.');
      }
    });
  }
}
