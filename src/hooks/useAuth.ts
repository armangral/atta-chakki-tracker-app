// useAuth.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import {
  loginSuccess,
  logout as logoutAction,
  setUser,
} from "@/store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { AuthService } from "@/services/authService";
import {
  LoginRequest,
  ResetPasswordRequest,
  SignupPayload,
  UpdatePasswordRequest,
} from "@/types/authTypes";
import { toast } from "@/hooks/use-toast";
import {
  MutationFunction,
  MutationKey,
  UseMutationOptions,
} from "@tanstack/react-query";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);

  // Query to fetch the current user if a token exists
  const {
    data: currentUserData,
    isLoading: isLoadingUser,
    error: userError,
    isError: isUserError,
  } = useQuery({
    queryKey: ["currentUser"],
    queryFn: AuthService.getCurrentUser,
    enabled: !!token,
    retry: (failureCount, error: any) => {
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      return failureCount < 3;
    },
  });

  useEffect(() => {
    if (currentUserData) {
      dispatch(setUser(currentUserData));
    }
  }, [currentUserData, dispatch]);

  useEffect(() => {
    if (isUserError && userError) {
      console.warn("Failed to fetch current user:", userError);
      dispatch(logoutAction());
    }
  }, [isUserError, userError, dispatch]);

  const {
    mutate: login,
    isPending: isLoggingIn,
    error: loginError,
  } = useMutation({
    mutationFn: (data: LoginRequest) => AuthService.login(data),
    onSuccess: (data) => {
      dispatch(loginSuccess(data));
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast({ title: "Signin Successfully!" });
      if (data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/pos"); // fallback route
      }
    },
    onError: (error: Error) => {
      console.error("Login failed:", error);
      toast({ title: error.message });
    },
  });

  const {
    mutate: signup,
    isPending: isSigningUp,
    error: signupError,
  } = useMutation({
    mutationFn: (data: SignupPayload) => AuthService.signup(data),
    onSuccess: (data) => {
      navigate("/login");
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast({ title: "User registered Successfully!" });
    },
    onError: (error: Error) => {
      console.error("Signup failed:", error);
      toast({ title: error.message });
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => AuthService.forgotPassword(email),
    onSuccess: () => {
      toast({ title: "Password reset email sent! Please check your inbox." });
    },
    onError: (error: Error) => {
      toast({ title: error.message });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (data: ResetPasswordRequest) => AuthService.resetPassword(data),
    onSuccess: () => {
      toast({
        title:
          "Password reset successful! Please login with your new password.",
      });
      navigate("/login", { replace: true });
    },
    onError: (error: Error) => {
      toast({ title: error.message });
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (data: UpdatePasswordRequest) =>
      AuthService.updatePassword(data),
    onSuccess: () => {
      toast({ title: "Password updated successfully!" });
    },
    onError: (error: Error) => {
      toast({ title: error.message });
    },
  });

  const logout = () => {
    dispatch(logoutAction());
    queryClient.clear();
  };

  // Updated forgotPassword to accept mutation options
  const forgotPassword = (
    email: string,
    options?: UseMutationOptions<void, Error, string>
  ) => {
    forgotPasswordMutation.mutate(email, options);
  };

  return {
    isAuthenticated,
    login,
    isLoggingIn,
    loginError,
    signup,
    isSigningUp,
    signupError,
    logout,
    isLoadingUser,
    user: currentUserData,
    forgotPassword,
    resetPassword: resetPasswordMutation.mutate,
    isForgettingPassword: forgotPasswordMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
  };
};
