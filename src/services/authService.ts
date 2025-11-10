import { isAxiosError } from "axios";
import { API_ENDPOINTS } from "@/config/apiConfig";
import {
  SignupRequest,
  LoginRequest,
  UpdateProfileRequest,
  VerifyEmailRequest,
  UpdatePasswordRequest,
  ResetPasswordRequest,
  AuthResponse,
  User,
  UserMe,
} from "@/types/authTypes";
import apiClient from "@/lib/api";

// ✅ Enhanced error handling
function handleError(error: unknown, defaultMessage: string): never {
  if (isAxiosError(error)) {
    const data = error.response?.data as Record<string, unknown> | undefined;

    // Try different possible error message fields
    const errorMessage =
      (data?.detail as string) ||
      (data?.message as string) ||
      (data?.error as string) ||
      error.response?.statusText;

    if (errorMessage) {
      throw new Error(errorMessage);
    }

    // Handle different status codes
    switch (error.response?.status) {
      case 400:
        throw new Error("Invalid request. Please check your input.");
      case 401:
        throw new Error("Authentication failed. Please login again.");
      case 403:
        throw new Error("You don't have permission to perform this action.");
      case 404:
        throw new Error("The requested resource was not found.");
      case 422:
        throw new Error("Validation failed. Please check your input.");
      case 500:
        throw new Error("Server error. Please try again later.");
      default:
        throw new Error(defaultMessage);
    }
  }

  throw new Error(defaultMessage);
}

export const AuthService = {
  // ✅ User registration
  async signup(data: SignupRequest): Promise<User> {
    try {
      const res = await apiClient.post<User>("/auth/register", data);
      return res.data;
    } catch (error) {
      handleError(error, "Failed to create account");
    }
  },

  // ✅ User login
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const res = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.auth.login,
        data
      );

      // Token is now managed by the hook, but we can still return it
      return res.data;
    } catch (error) {
      handleError(error, "Failed to log in");
    }
  },

  // ✅ Get current user
  async getCurrentUser(): Promise<UserMe> {
    try {
      const res = await apiClient.get<UserMe>(API_ENDPOINTS.auth.me);
      return res.data;
    } catch (error) {
      handleError(error, "Failed to fetch user information");
    }
  },

  // ✅ Get user profile
  async getProfile(): Promise<User> {
    try {
      const res = await apiClient.get<User>(API_ENDPOINTS.user.profile);
      return res.data;
    } catch (error) {
      handleError(error, "Failed to fetch profile");
    }
  },

  // ✅ Update user profile
  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    try {
      const res = await apiClient.patch<User>(
        API_ENDPOINTS.user.updateProfile,
        data
      );
      return res.data;
    } catch (error) {
      handleError(error, "Failed to update profile");
    }
  },

  // ✅ Email verification
  async verifyEmail(data: VerifyEmailRequest) {
    try {
      const res = await apiClient.post(
        `${API_ENDPOINTS.auth.verifyEmail}/${data.token}`
      );
      return res.data;
    } catch (error) {
      handleError(error, "Failed to verify email");
    }
  },

  // ✅ Update password
  async updatePassword(data: UpdatePasswordRequest) {
    try {
      const res = await apiClient.post(
        `${API_ENDPOINTS.auth.updatePassword}?new_password=${encodeURIComponent(
          data.password
        )}`
      );
      return res.data;
    } catch (error) {
      handleError(error, "Failed to update password");
    }
  },

  // ✅ Forgot password
  async forgotPassword(email: string) {
    try {
      const res = await apiClient.post(
        `${API_ENDPOINTS.auth.forgotPassword}?email=${encodeURIComponent(
          email
        )}`
      );
      return res.data;
    } catch (error) {
      handleError(error, "Failed to send password reset email");
    }
  },

  // Resend Verification
  async resendVerification(email: string) {
    try {
      const res = await apiClient.post(
        `${API_ENDPOINTS.auth.resendVerification}?email=${encodeURIComponent(
          email
        )}`
      );
      return res.data;
    } catch (error) {
      handleError(error, "Failed to resend verification email");
    }
  },

  // ✅ Reset password
  async resetPassword(data: ResetPasswordRequest) {
    try {
      const res = await apiClient.post(
        `${API_ENDPOINTS.auth.resetPassword}/${
          data.token
        }?new_password=${encodeURIComponent(data.new_password)}`
      );
      return res.data;
    } catch (error) {
      handleError(error, "Failed to reset password");
    }
  },

  // ✅ Logout (client-side cleanup)
  logout() {
    // tokenManager.remove();
    // You can add server-side logout API call here if needed
    // Example:
    // try {
    //   await apiClient.post(API_ENDPOINTS.auth.logout);
    // } catch (error) {
    //   // Handle logout error if needed
    // }
    localStorage.removeItem("accessToken");
  },

  // ✅ Refresh token (if your API supports it)
  //   async refreshToken(refreshToken: string): Promise<AuthResponse> {
  //     try {
  //       const res = await apiClient.post<AuthResponse>(
  //         API_ENDPOINTS.auth.refresh,
  //         { refresh_token: refreshToken }
  //       );
  //       return res.data;
  //     } catch (error) {
  //       handleError(error, "Failed to refresh token");
  //     }
  //   },
};
