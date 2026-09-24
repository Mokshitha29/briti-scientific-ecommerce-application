import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { EnquiryService } from '../../core/services/enquiry.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Enquiry } from '../../core/models/enquiry.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-enquiry',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent],
  template: `
    <div class="container-fluid px-lg-5 py-4">
      <div class="mb-4 pb-2 border-bottom">
        <h2 class="fw-bold text-navy mb-1">Chemical Sourcing & Technical Enquiries</h2>
        <small class="text-muted">Request custom synthesis, bulk packing quotes, and specialized pharmaceutical impurities</small>
      </div>

      <div class="row g-4">
        <!-- Enquiry Submission Form -->
        <div class="col-12 col-lg-7">
          <div class="card scientific-card border shadow-sm p-4 p-md-5">
            <h5 class="fw-bold text-navy mb-3 pb-2 border-bottom">
              <i class="bi bi-pencil-square text-primary me-2"></i> Submit Chemical Specification Request
            </h5>

            <form [formGroup]="enquiryForm" (ngSubmit)="onSubmit()">
              <div class="row g-3 mb-3">
                <div class="col-12 col-md-6">
                  <label class="form-label small fw-bold text-dark">Company / Institute Name *</label>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="e.g. BioTech Research Center"
                    formControlName="companyName"
                    [class.is-invalid]="f['companyName'].touched && f['companyName'].invalid"
                  />
                  <div *ngIf="f['companyName'].touched && f['companyName'].invalid" class="text-danger small mt-1">
                    Company name is required.
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label small fw-bold text-dark">Contact Person *</label>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="e.g. Dr. Priya Sharma"
                    formControlName="customerName"
                    [class.is-invalid]="f['customerName'].touched && f['customerName'].invalid"
                  />
                  <div *ngIf="f['customerName'].touched && f['customerName'].invalid" class="text-danger small mt-1">
                    Customer name is required.
                  </div>
                </div>
              </div>

              <div class="row g-3 mb-3">
                <div class="col-12 col-md-6">
                  <label class="form-label small fw-bold text-dark">Official Email *</label>
                  <input
                    type="email"
                    class="form-control"
                    placeholder="name@company.com"
                    formControlName="officialEmail"
                    [class.is-invalid]="f['officialEmail'].touched && f['officialEmail'].invalid"
                  />
                  <div *ngIf="f['officialEmail'].touched && f['officialEmail'].invalid" class="text-danger small mt-1">
                    Valid email is required.
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <label class="form-label small fw-bold text-dark">Contact Phone *</label>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="+91 98765 43210"
                    formControlName="phone"
                    [class.is-invalid]="f['phone'].touched && f['phone'].invalid"
                  />
                  <div *ngIf="f['phone'].touched && f['phone'].invalid" class="text-danger small mt-1">
                    Phone number is required.
                  </div>
                </div>
              </div>

              <div class="row g-3 mb-3">
                <div class="col-12 col-md-8">
                  <label class="form-label small fw-bold text-dark">Chemical Name / Reagent *</label>
                  <input
                    type="text"
                    class="form-control"
                    placeholder="e.g. Acetonitrile LC-MS Ultra Grade"
                    formControlName="chemicalName"
                    [class.is-invalid]="f['chemicalName'].touched && f['chemicalName'].invalid"
                  />
                  <div *ngIf="f['chemicalName'].touched && f['chemicalName'].invalid" class="text-danger small mt-1">
                    Chemical name is required.
                  </div>
                </div>

                <div class="col-12 col-md-4">
                  <label class="form-label small fw-bold text-dark">CAS Number</label>
                  <input
                    type="text"
                    class="form-control font-monospace"
                    placeholder="e.g. 75-05-8"
                    formControlName="casNumber"
                  />
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-bold text-dark">Required Quantity & Packing *</label>
                <input
                  type="text"
                  class="form-control"
                  placeholder="e.g. 20 x 2.5 Litre bottles or 50 kg drum"
                  formControlName="requiredQuantity"
                  [class.is-invalid]="f['requiredQuantity'].touched && f['requiredQuantity'].invalid"
                />
                <div *ngIf="f['requiredQuantity'].touched && f['requiredQuantity'].invalid" class="text-danger small mt-1">
                  Required quantity is required.
                </div>
              </div>

              <div class="mb-4">
                <label class="form-label small fw-bold text-dark">Specific Requirements / Target Purity *</label>
                <textarea
                  class="form-control"
                  rows="3"
                  placeholder="Specify HPLC purity, moisture limits, pharmacopeial grade (USP/EP/BP), or testing deadlines..."
                  formControlName="message"
                  [class.is-invalid]="f['message'].touched && f['message'].invalid"
                ></textarea>
                <div *ngIf="f['message'].touched && f['message'].invalid" class="text-danger small mt-1">
                  Message / specification description is required.
                </div>
              </div>

              <button
                type="submit"
                class="btn btn-briti-primary w-100 py-3 fw-bold"
                [disabled]="enquiryForm.invalid || isSubmitting"
              >
                <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
                <i *ngIf="!isSubmitting" class="bi bi-send-fill me-2"></i>
                {{ isSubmitting ? 'Submitting Enquiry...' : 'Submit Chemical Enquiry' }}
              </button>
            </form>
          </div>
        </div>

        <!-- Right: Past Enquiries Tracker -->
        <div class="col-12 col-lg-5">
          <div class="card scientific-card border shadow-sm p-4 sticky-top" style="top: 80px;">
            <h5 class="fw-bold text-navy mb-3 pb-2 border-bottom">
              <i class="bi bi-clock-history text-primary me-2"></i> Track Your Chemical Enquiries
            </h5>

            <div *ngIf="!isLoggedIn" class="p-3 bg-light rounded text-center small text-muted">
              <p class="mb-2">Log in with your institutional account to view live status updates of your submitted enquiries.</p>
              <a routerLink="/login" class="btn btn-sm btn-outline-primary fw-semibold">Login to Track</a>
            </div>

            <div *ngIf="isLoggedIn">
              <app-loading-spinner [show]="isLoadingEnquiries" message="Loading your enquiries..."></app-loading-spinner>

              <div *ngIf="!isLoadingEnquiries && userEnquiries.length === 0" class="text-center py-4 text-muted small">
                <i class="bi bi-journal-x fs-2 d-block opacity-50 mb-2"></i>
                You have not submitted any enquiries yet.
              </div>

              <div *ngIf="!isLoadingEnquiries && userEnquiries.length > 0" class="list-group list-group-flush" style="max-height: 400px; overflow-y: auto;">
                <div *ngFor="let item of userEnquiries" class="list-group-item px-0 py-3 border-bottom">
                  <div class="d-flex justify-content-between align-items-start mb-1">
                    <span class="fw-bold text-navy small">{{ item.chemicalName }}</span>
                    <span class="badge" [ngClass]="{
                      'bg-warning text-dark': item.status === 'New',
                      'bg-info text-dark': item.status === 'Contacted',
                      'bg-success': item.status === 'Resolved'
                    }">
                      {{ item.status }}
                    </span>
                  </div>
                  <div class="small text-muted mb-1">
                    <span>CAS: {{ item.casNumber || 'N/A' }}</span> • <span>Qty: {{ item.requiredQuantity }}</span>
                  </div>
                  <small class="text-secondary d-block text-truncate">{{ item.message }}</small>
                  <small class="text-muted d-block mt-1" style="font-size: 0.72rem;">{{ item.createdAt | date:'mediumDate' }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EnquiryComponent implements OnInit {
  enquiryForm!: FormGroup;
  isSubmitting: boolean = false;
  isLoggedIn: boolean = false;
  isLoadingEnquiries: boolean = false;
  userEnquiries: Enquiry[] = [];

  constructor(
    private fb: FormBuilder,
    private enquiryService: EnquiryService,
    private authService: AuthService,
    private toastService: ToastService,
    private route: ActivatedRoute
  ) {}

  get f() {
    return this.enquiryForm.controls;
  }

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();
    const user = this.authService.getCurrentUser();

    this.enquiryForm = this.fb.group({
      companyName: [user?.companyName || '', Validators.required],
      customerName: [user?.fullName || '', Validators.required],
      officialEmail: [user?.email || '', [Validators.required, Validators.email]],
      phone: [user?.phone || '', Validators.required],
      chemicalName: ['', Validators.required],
      casNumber: [''],
      requiredQuantity: ['', Validators.required],
      message: ['', Validators.required]
    });

    // Check query params
    this.route.queryParams.subscribe((params) => {
      if (params['chemical']) this.enquiryForm.patchValue({ chemicalName: params['chemical'] });
      if (params['cas']) this.enquiryForm.patchValue({ casNumber: params['cas'] });
      if (params['quantity']) this.enquiryForm.patchValue({ requiredQuantity: params['quantity'] });
    });

    if (this.isLoggedIn) {
      this.loadUserEnquiries();
    }
  }

  loadUserEnquiries() {
    this.isLoadingEnquiries = true;
    this.enquiryService.getMyEnquiries().subscribe({
      next: (res) => {
        if (res.success) this.userEnquiries = res.data;
        this.isLoadingEnquiries = false;
      },
      error: () => {
        this.isLoadingEnquiries = false;
      }
    });
  }

  onSubmit() {
    if (this.enquiryForm.invalid) return;

    this.isSubmitting = true;
    this.enquiryService.submitEnquiry(this.enquiryForm.value).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.toastService.success(res.message || 'Chemical enquiry submitted successfully!');
        this.enquiryForm.reset();
        if (this.isLoggedIn) {
          this.loadUserEnquiries();
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toastService.error(err.error?.message || 'Failed to submit enquiry.');
      }
    });
  }
}
