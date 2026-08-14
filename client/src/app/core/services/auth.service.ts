import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

import {
  AuthResponse,
  ChangePasswordPayload,
  ChangePasswordResponse,
  LoginPayload,
  LogoutResponse,
  RegisterPayload,
} from '../../models/auth.model';
import { User, UserRole } from '../../models/user.model';
import { API_BASE_URL, AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl: string = `${API_BASE_URL}/auth`;
  private readonly profileUrl: string = `${API_BASE_URL}/users/me`;

  constructor(private readonly http: HttpClient) {}

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, payload)
      .pipe(tap((response: AuthResponse) => this.persistSession(response)));
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/register`, payload)
      .pipe(tap((response: AuthResponse) => this.persistSession(response)));
  }

  logout(): Observable<LogoutResponse> {
    return this.http
      .post<LogoutResponse>(`${this.baseUrl}/logout`, {})
      .pipe(tap(() => this.clearSession()));
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(this.profileUrl);
  }

  changePassword(payload: ChangePasswordPayload): Observable<ChangePasswordResponse> {
    return this.http.patch<ChangePasswordResponse>(`${this.profileUrl}/password`, payload);
  }

  getToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  getStoredUser(): User | null {
    const raw: string | null = localStorage.getItem(AUTH_USER_KEY);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  }

  getRole(): UserRole | null {
    return this.getStoredUser()?.role ?? null;
  }

  isAdmin(): boolean {
    return this.getRole() === 'admin';
  }

  private persistSession(response: AuthResponse): void {
    localStorage.setItem(AUTH_TOKEN_KEY, response.accessToken);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
  }

  clearSession(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  }
}
