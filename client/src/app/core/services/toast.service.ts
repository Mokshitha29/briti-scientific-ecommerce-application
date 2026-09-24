import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'danger' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts$ = new BehaviorSubject<Toast[]>([]);
  public toasts = this.toasts$.asObservable();
  private counter = 0;

  show(message: string, type: 'success' | 'danger' | 'warning' | 'info' = 'info') {
    const id = ++this.counter;
    const current = this.toasts$.value;
    this.toasts$.next([...current, { id, message, type }]);

    setTimeout(() => {
      this.remove(id);
    }, 4500);
  }

  success(message: string) {
    this.show(message, 'success');
  }

  error(message: string) {
    this.show(message, 'danger');
  }

  warning(message: string) {
    this.show(message, 'warning');
  }

  info(message: string) {
    this.show(message, 'info');
  }

  remove(id: number) {
    this.toasts$.next(this.toasts$.value.filter((t) => t.id !== id));
  }
}
