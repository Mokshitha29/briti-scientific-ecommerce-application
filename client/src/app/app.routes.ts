import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent)
  },
  {
    path: 'products',
    loadComponent: () => import('./pages/products/product-list/product-list.component').then((m) => m.ProductListComponent)
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./pages/products/product-details/product-details.component').then((m) => m.ProductDetailsComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register.component').then((m) => m.RegisterComponent)
  },
  {
    path: 'cart',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/cart/cart.component').then((m) => m.CartComponent)
  },
  {
    path: 'checkout',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/checkout/checkout.component').then((m) => m.CheckoutComponent)
  },
  {
    path: 'payment/:orderId',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/payment/payment.component').then((m) => m.PaymentComponent)
  },
  {
    path: 'payment-success/:orderId',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/payment-success/payment-success.component').then((m) => m.PaymentSuccessComponent)
  },
  {
    path: 'payment-failed/:orderId',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/payment-failed/payment-failed.component').then((m) => m.PaymentFailedComponent)
  },
  {
    path: 'order-success/:orderId',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/order-success/order-success.component').then((m) => m.OrderSuccessComponent)
  },
  {
    path: 'my-orders',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/my-orders/my-orders.component').then((m) => m.MyOrdersComponent)
  },
  {
    path: 'my-orders/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/my-orders/order-details.component').then((m) => m.OrderDetailsComponent)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile/profile.component').then((m) => m.ProfileComponent)
  },
  {
    path: 'enquiry',
    loadComponent: () => import('./pages/enquiry/enquiry.component').then((m) => m.EnquiryComponent)
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about.component').then((m) => m.AboutComponent)
  },
  {
    path: 'resources',
    loadComponent: () => import('./pages/resources/resources.component').then((m) => m.ResourcesComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact.component').then((m) => m.ContactComponent)
  },

  // Admin Routes (protected by adminGuard)
  {
    path: 'admin/dashboard',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin/dashboard/admin-dashboard.component').then((m) => m.AdminDashboardComponent)
  },
  {
    path: 'admin/products',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin/products/admin-products.component').then((m) => m.AdminProductsComponent)
  },
  {
    path: 'admin/categories',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin/categories/admin-categories.component').then((m) => m.AdminCategoriesComponent)
  },
  {
    path: 'admin/orders',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin/orders/admin-orders.component').then((m) => m.AdminOrdersComponent)
  },
  {
    path: 'admin/users',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin/users/admin-users.component').then((m) => m.AdminUsersComponent)
  },
  {
    path: 'admin/enquiries',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin/enquiries/admin-enquiries.component').then((m) => m.AdminEnquiriesComponent)
  },
  {
    path: 'admin/contact-messages',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin/contact-messages/admin-contact-messages.component').then((m) => m.AdminContactMessagesComponent)
  },

  // Errors & Fallback
  {
    path: '403',
    loadComponent: () => import('./pages/errors/403/403.component').then((m) => m.Error403Component)
  },
  {
    path: '404',
    loadComponent: () => import('./pages/errors/404/404.component').then((m) => m.Error404Component)
  },
  {
    path: '**',
    redirectTo: '404'
  }
];
