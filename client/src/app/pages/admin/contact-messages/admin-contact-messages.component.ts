import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../../../core/services/contact.service';
import { ToastService } from '../../../core/services/toast.service';
import { ContactMessage } from '../../../core/models/contact.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-admin-contact-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  template: `
    <div class="container-fluid px-lg-5 py-4">
      <div class="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 class="fw-bold text-navy mb-0">Customer Contact Messages Desk</h2>
          <small class="text-muted">Manage general inquiries, technical questions, and support messages submitted by customers</small>
        </div>
      </div>

      <!-- Filters -->
      <div class="card scientific-card border p-3 mb-4">
        <div class="row g-2 align-items-center">
          <div class="col-12 col-md-4">
            <select class="form-select form-select-sm" [(ngModel)]="selectedStatus" (change)="loadMessages()">
              <option value="">All Message Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
          <div class="col-12 col-md-8 text-md-end">
            <small class="text-muted">Total: <strong>{{ messages.length }}</strong> messages</small>
          </div>
        </div>
      </div>

      <app-loading-spinner [show]="isLoading" message="Fetching contact messages..."></app-loading-spinner>

      <div *ngIf="!isLoading" class="card scientific-card border shadow-sm">
        <div *ngIf="messages.length === 0" class="p-5 text-center text-muted">
          <i class="bi bi-inbox fs-1 d-block mb-2 text-secondary"></i>
          <p class="mb-0 fw-semibold">No contact messages found.</p>
          <small class="text-muted">Customer messages submitted via the Contact page will appear here.</small>
        </div>

        <div *ngIf="messages.length > 0" class="table-responsive-custom">
          <table class="scientific-table mb-0">
            <thead>
              <tr>
                <th>Customer / Sender</th>
                <th>Subject</th>
                <th>Message Snippet</th>
                <th>Contact Details</th>
                <th>Submitted Date</th>
                <th>Status</th>
                <th class="text-end">Manage</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let msg of messages">
                <td>
                  <strong class="text-navy d-block">{{ msg.name }}</strong>
                </td>
                <td>
                  <span class="fw-semibold text-dark">{{ msg.subject }}</span>
                </td>
                <td>
                  <small class="text-muted text-truncate d-inline-block" style="max-width: 250px;">
                    {{ msg.message }}
                  </small>
                </td>
                <td class="small">
                  <div class="font-monospace text-primary">{{ msg.email }}</div>
                  <div class="text-muted">{{ msg.phone || 'No phone provided' }}</div>
                </td>
                <td class="small text-muted">
                  {{ msg.createdAt | date:'mediumDate' }}
                </td>
                <td>
                  <span
                    class="badge"
                    [ngClass]="{
                      'bg-warning text-dark': msg.status === 'New',
                      'bg-info text-dark': msg.status === 'Contacted',
                      'bg-success': msg.status === 'Resolved'
                    }"
                  >
                    {{ msg.status }}
                  </span>
                </td>
                <td class="text-end">
                  <button class="btn btn-sm btn-outline-primary" (click)="openDetailModal(msg)">
                    <i class="bi bi-eye me-1"></i> View / Update
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Contact Message Details & Status Update Modal -->
    <div
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(0,0,0,0.5);"
      *ngIf="showModal && selectedMessage"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content shadow border-0">
          <div class="modal-header bg-navy text-white">
            <h5 class="modal-title fw-bold">Message Details: {{ selectedMessage.subject }}</h5>
            <button type="button" class="btn-close btn-close-white" (click)="showModal = false"></button>
          </div>
          <div class="modal-body p-4">
            <div class="row g-3 mb-3">
              <div class="col-6">
                <small class="text-muted d-block">Sender Name:</small>
                <strong class="text-dark">{{ selectedMessage.name }}</strong>
              </div>
              <div class="col-6">
                <small class="text-muted d-block">Email Address:</small>
                <strong class="font-monospace text-primary">{{ selectedMessage.email }}</strong>
              </div>
              <div class="col-6">
                <small class="text-muted d-block">Phone Number:</small>
                <strong class="text-dark">{{ selectedMessage.phone || 'Not provided' }}</strong>
              </div>
              <div class="col-6">
                <small class="text-muted d-block">Date Received:</small>
                <strong class="text-dark">{{ selectedMessage.createdAt | date:'medium' }}</strong>
              </div>
            </div>

            <div class="p-3 bg-light rounded border mb-3">
              <div class="fw-bold text-navy mb-1">Subject: {{ selectedMessage.subject }}</div>
              <hr class="my-2" />
              <div class="small fw-bold text-muted mb-1">Message Content:</div>
              <p class="mb-0 text-dark lh-base" style="white-space: pre-wrap;">{{ selectedMessage.message }}</p>
            </div>

            <div>
              <label class="form-label small fw-bold text-dark">Update Message Status</label>
              <select class="form-select" [(ngModel)]="newStatus">
                <option value="New">New (Unreviewed)</option>
                <option value="Contacted">Contacted (Customer Replied)</option>
                <option value="Resolved">Resolved (Issue Addressed / Closed)</option>
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
export class AdminContactMessagesComponent implements OnInit {
  messages: ContactMessage[] = [];
  isLoading: boolean = true;
  selectedStatus: string = '';

  showModal: boolean = false;
  selectedMessage: ContactMessage | null = null;
  newStatus: 'New' | 'Contacted' | 'Resolved' = 'New';

  constructor(
    private contactService: ContactService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadMessages();
  }

  loadMessages() {
    this.isLoading = true;
    const filter: any = {};
    if (this.selectedStatus) filter.status = this.selectedStatus;

    this.contactService.getContactMessages(filter).subscribe({
      next: (res) => {
        if (res.success) this.messages = res.data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.toastService.error(err.error?.message || 'Failed to load contact messages.');
      }
    });
  }

  openDetailModal(msg: ContactMessage) {
    this.selectedMessage = msg;
    this.newStatus = msg.status;
    this.showModal = true;
  }

  saveStatus() {
    if (!this.selectedMessage || !this.selectedMessage._id) return;

    this.contactService.updateContactStatus(this.selectedMessage._id, this.newStatus).subscribe({
      next: (res) => {
        this.toastService.success(`Contact message status updated to ${this.newStatus}.`);
        this.showModal = false;
        this.loadMessages();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Failed to update message status.');
      }
    });
  }
}
