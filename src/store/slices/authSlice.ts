import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/store/store";
import { UserMe } from "@/types/authTypes";

interface AuthPayload {
  user_id: string;
  token_type: string;
  access_token: string;
  refresh_token: string;
}

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  token: localStorage.getItem("accessToken") || null,
  isAuthenticated: !!localStorage.getItem("accessToken"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<AuthPayload>) => {
      state.token = action.payload.access_token;
      state.isAuthenticated = true;
      localStorage.setItem("accessToken", action.payload.access_token);
      localStorage.setItem("refreshToken", action.payload.refresh_token);
    },
    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      localStorage.clear();
      // This forces a reload and redirect via the ProtectedRoute
      window.location.pathname = "/login";
    },
    setUser: (state, action: PayloadAction<UserMe>) => {
      state.isAuthenticated = true; // Ensure this is set if user is fetched
    },
  },
});

export const { loginSuccess, logout, setUser } = authSlice.actions;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export default authSlice.reducer;
