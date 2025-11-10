// ---------- Request DTOs ----------
export interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

export interface SignupPayload {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  avatar?: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface UpdatePasswordRequest {
  password: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

// ---------- Response DTOs ----------
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user_id: string;
  is_admin: boolean;
  role: string;
}

export interface Subscription {
  plan_name: string;
  status: string;
  current_period_start: string; // ISO date string
  current_period_end: string; // ISO date string
  cancel_at_period_end: boolean;
  id: string; // UUID
  user_id: string; // UUID
  stripe_subscription_id: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  coin_balance: number;
  is_admin: boolean;
  is_active: boolean;
}

export interface UserMe {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "dme_admin" | "hospice_nurse" | "driver" | string;
  is_active: boolean;
  time_created: string;
  time_updated: string;
  last_login?: string;
  roles: [{ role: string }];
}

export interface ApiError {
  detail: string;
}
