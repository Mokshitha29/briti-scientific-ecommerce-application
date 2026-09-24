import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-payment-failed',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-5 my-4">
      <div class="row justify-content-center">
        <div class="col-12 col-md-8 col-lg-6 text-center">
          <div class="card scientific-card border shadow-sm p-4 p-md-5">
            <!-- Failure Icon -->
            <div class="bg-danger text-white rounded-circle mx-auto p-3 mb-3 d-flex align-items-center justify-content-center shadow" style="width: 80px; height: 80px;">
              <i class="bi bi-x-lg fs-1"></i>
            </div>

            <h3 class="fw-bold text-danger mb-2">Simulated Payment Declined</h3>
            <p class="text-muted small mb-4">
              {{ errorMessage || 'The simulated payment could not be authorized with the entered credentials. Your chemical cart and stock reservation remain intact.' }}
            </p>

            <div class="p-3 bg-light rounded border small mb-4 text-start">
              <span class="fw-bold text-dark d-block mb-1">
                <i class="bi bi-lightbulb text-warning me-1"></i> Testing Suggestion:
              </span>
              <p class="mb-0 text-muted">
                To test a successful transaction, use demo card <strong>4111 1111 1111 1111</strong>, demo UPI <strong>test&#64;upi</strong>, or choose any <strong>Net Banking</strong> bank.
              </p>
            </div>

            <div class="d-flex flex-column flex-sm-row gap-2 justify-content-center">
              <a [routerLink]="['/payment', orderId]" class="btn btn-briti-primary fw-semibold px-4">
                <i class="bi bi-arrow-repeat me-1"></i> Try Payment Again
              </a>
              <a routerLink="/cart" class="btn btn-outline-secondary fw-semibold px-4">
                Back to Cart
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PaymentFailedComponent implements OnInit {
  orderId: string = '';
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras.state) {
      this.errorMessage = nav.extras.state['message'] || '';
    }
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.orderId = params['orderId'];
    });
  }
}
