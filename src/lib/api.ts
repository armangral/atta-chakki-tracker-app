import axios, { InternalAxiosRequestConfig } from "axios";
import { loginSuccess, logout } from "@/store/slices/authSlice";
import { store } from "@/store/store";
import { toast } from "@/hooks/use-toast";

const apiClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL || "http://10.249.88.35:8000/api/v1",
});

console.log("urlhere", import.meta.env.VITE_API_BASE_URL);

// Request Interceptor: Injects the auth token into headers before each request
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handles 401 Unauthorized errors for token refreshing
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    console.log("=== ERROR INTERCEPTOR ===");
    console.log("Status:", error.response?.status);
    console.log("URL:", originalRequest?.url);
    console.log("_retry before check:", originalRequest._retry);

    // Check if this is an authentication endpoint
    const isAuthEndpoint =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/register") ||
      originalRequest?.url?.includes("/auth/refresh");

    // Handle 401 errors
    if (error.response?.status === 401) {
      // For auth endpoints (login/register), just pass through without toast
      // Let the hooks handle the error messages
      if (isAuthEndpoint) {
        console.log("Auth endpoint error, letting hooks handle it");
        return Promise.reject(error);
      }

      // For non-auth endpoints, attempt token refresh
      if (!originalRequest._retry) {
        console.log("Attempting token refresh for expired token");
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem("refreshToken");
          if (!refreshToken) {
            console.log("No refresh token available, logging out");
            toast({ title: "Your session has expired. Please log in again." });
            store.dispatch(logout());
            return Promise.reject(error);
          }

          // Call your API's endpoint to refresh the token
          const { data } = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
            {
              params: { refresh_token: refreshToken },
            }
          );

          console.log("Token refreshed successfully");
          // Optional: You can remove this toast if you don't want to show refresh success
          // toast.success("Session refreshed successfully");

          // Dispatch the loginSuccess action to update the Redux store and localStorage
          store.dispatch(loginSuccess(data));

          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          console.log("Token refresh failed, logging out");
          toast({ title: "Your session has expired. Please log in again." });
          store.dispatch(logout());
          return Promise.reject(refreshError);
        }
      } else {
        // Already tried to refresh, show error
        toast({ title: "Authentication failed. Please try again." });
        return Promise.reject(error);
      }
    }

    // For non-401 errors, you can optionally show generic error toasts
    // Comment out these if you're handling them in your hooks/components too
    if (error.response?.status >= 500) {
      toast({ title: "Server error. Please try again later." });
    } else if (error.response?.status === 403) {
      toast({ title: "You don't have permission to perform this action." });
    } else if (error.response?.status === 404) {
      toast({ title: "The requested resource was not found." });
    }

    return Promise.reject(error);
  }
);

export default apiClient;
