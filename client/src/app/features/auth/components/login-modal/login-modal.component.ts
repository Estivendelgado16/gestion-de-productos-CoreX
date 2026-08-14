import { Component, HostListener, inject } from '@angular/core';

import { LoginModalService } from '../../../../core/services/login-modal.service';
import { LoginComponent } from '../../pages/login/login.component';

@Component({
  selector: 'tolla-login-modal',
  imports: [LoginComponent],
  templateUrl: './login-modal.component.html',
  styleUrl: './login-modal.component.scss',
})
export class LoginModalComponent {
  private readonly loginModalService: LoginModalService = inject(LoginModalService);

  readonly isOpen = this.loginModalService.isOpen;

  close(): void {
    this.loginModalService.close();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) {
      this.close();
    }
  }
}
