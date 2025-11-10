// src/services/attaChakkiService.ts
import apiClient from "@/lib/api";

/* -------------------------------------------------------------------------- */
/*  Common types (mirroring the OAS schemas)                                 */
/* -------------------------------------------------------------------------- */

export type UUID = string;

export interface PaginationParams {
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

/* ----- Auth --------------------------------------------------------------- */
export interface RegisterDto {
  username: string;
  password: string;
  email?: string;
}
export interface LoginDto {
  username: string;
  password: string;
}
export interface RefreshTokenDto {
  refresh_token: string;
}
export interface ForgotPasswordDto {
  email: string;
}
export interface ResetPasswordDto {
  token: string;
  new_password: string;
}
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

/* ----- Users -------------------------------------------------------------- */

export interface UserCreateDto {
  username: string;
  password: string;
  email?: string;
}
export interface UserUpdateDto {
  username?: string;
  email?: string;
  password?: string;
}

/* ----- Users -------------------------------------------------------------- */
export interface UserProfile {
  username: string;
  id: UUID;
}

export interface UserResponse {
  id: UUID;
  email: string;
  is_active: boolean;
  created_at: string; // ISO
  updated_at: string; // ISO
  profile: UserProfile;
  roles: string[];
}

/* Payload for the paginated list */
export interface UsersListResponse {
  total: number;
  page: number;
  page_size: number;
  users: UserResponse[];
}

/* What a regular user can update */
export interface UserSelfUpdateDto {
  username?: string;
}

/* What an admin can update (full) */
export interface UserAdminUpdateDto {
  email?: string;
  password?: string;
  is_active?: boolean;
}

/* Role assignment payload */
export interface RoleAssignmentResponse {
  user_id: UUID;
  roles: string[];
}

/* ----- Products ----------------------------------------------------------- */
export interface ProductResponse {
  id: UUID;
  name: string;
  category: string;
  unit: string;
  price: string; // decimal as string (high precision)
  stock: number;
  low_stock_threshold: number;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
  is_low_stock: boolean;
}
export interface ProductCreateDto {
  name: string;
  category: string;
  unit: string;
  price: number | string;
  stock?: number;
  low_stock_threshold?: number;
  status?: "active" | "inactive";
}
export interface ProductUpdateDto {
  name?: string;
  category?: string;
  unit?: string;
  price?: number | string;
  stock?: number;
  low_stock_threshold?: number;
  status?: "active" | "inactive";
}
export interface ProductStockUpdateDto {
  stock: number;
}

/* ----- Sales -------------------------------------------------------------- */
export interface SaleResponse {
  id: UUID;
  product_id: UUID;
  product_name: string;
  quantity: string; // decimal string
  total: string; // decimal string
  date: string;
  operator_id: UUID;
  operator_name: string;
  bill_id: UUID;
}
export interface SaleCreateDto {
  product_id: UUID;
  quantity: number | string;
  total: number | string;
  date?: string;
}

export interface SaleUpdateDto {
  product_id?: UUID;
  quantity?: number | string;
  total?: number | string;
  date?: string;
}

export interface CheckoutItemDto {
  product_id: UUID;
  quantity: number | string;
  total: number | string;
}
export interface CheckoutDto {
  items: CheckoutItemDto[];
  date?: string;
}
export interface CheckoutResponse {
  bill_id: UUID;
  items: SaleResponse[];
  total_amount: string;
  total_quantity: string;
  operator_name: string;
  date: string;
}

/* ----- Analytics ---------------------------------------------------------- */
export interface DashboardStats {
  today_revenue: string;
  today_transactions: number;
  week_revenue: string;
  week_transactions: number;
  month_revenue: string;
  month_transactions: number;
  total_products: number;
  active_products: number;
  low_stock_count: number;
  total_operators: number;
}

/* -------------------------------------------------------------------------- */
/*  Service object                                                            */
/* -------------------------------------------------------------------------- */

export const attaChakkiService = {
  /* ------------------- Auth ------------------- */
  register: async (data: RegisterDto): Promise<TokenResponse> => {
    const res = await apiClient.post("/auth/register", data);
    return res.data;
  },

  login: async (data: LoginDto): Promise<TokenResponse> => {
    const res = await apiClient.post("/auth/login", data);
    return res.data;
  },

  refresh: async (data: RefreshTokenDto): Promise<TokenResponse> => {
    const res = await apiClient.post("/auth/refresh", data);
    return res.data;
  },

  forgotPassword: async (data: ForgotPasswordDto): Promise<void> => {
    await apiClient.post("/auth/forgot-password", data);
  },

  resetPassword: async (data: ResetPasswordDto): Promise<void> => {
    await apiClient.post("/auth/reset-password", data);
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout");
  },

  /* ------------------- Users ------------------- */
  /* ------------------- Users ------------------- */
  /** GET /users/me */
  getMe: async (): Promise<UserResponse> => {
    const { data } = await apiClient.get<UserResponse>("/users/me");
    return data;
  },

  /** PUT /users/me */
  updateMe: async (dto: UserSelfUpdateDto): Promise<UserResponse> => {
    const { data } = await apiClient.put<UserResponse>("/users/me", dto);
    return data;
  },

  /** GET /users (admin) – paginated */
  listUsers: async (params?: PaginationParams): Promise<UsersListResponse> => {
    const { data } = await apiClient.get<UsersListResponse>("/users", {
      params,
    });
    return data;
  },

  /** GET /users/{user_id} (admin) */
  getUser: async (user_id: UUID): Promise<UserResponse> => {
    const { data } = await apiClient.get<UserResponse>(`/users/${user_id}`);
    return data;
  },

  /** PUT /users/{user_id} (admin) */
  updateUser: async (
    user_id: UUID,
    dto: UserAdminUpdateDto
  ): Promise<UserResponse> => {
    const { data } = await apiClient.put<UserResponse>(
      `/users/${user_id}`,
      dto
    );
    return data;
  },

  /** DELETE /users/{user_id} (admin) */
  deleteUser: async (user_id: UUID): Promise<void> => {
    await apiClient.delete(`/users/${user_id}`);
  },

  /** POST /users/{user_id}/roles (admin) */
  assignRole: async (
    user_id: UUID,
    role: string
  ): Promise<RoleAssignmentResponse> => {
    const { data } = await apiClient.post<RoleAssignmentResponse>(
      `/users/${user_id}/roles`,
      { role }
    );
    return data;
  },

  /** DELETE /users/{user_id}/roles/{role} (admin) */
  revokeRole: async (
    user_id: UUID,
    role: string
  ): Promise<RoleAssignmentResponse> => {
    const { data } = await apiClient.delete<RoleAssignmentResponse>(
      `/users/${user_id}/roles/${role}`
    );
    return data;
  },

  /** GET /users/operators/list (admin) */
  listOperators: async (): Promise<UserResponse[]> => {
    const { data } = await apiClient.get<UserResponse[]>(
      "/users/operators/list"
    );
    return data;
  },

  /** POST /api/v1/users (admin only) */
  createUser: async (dto: UserCreateDto): Promise<UserResponse> => {
    const { data } = await apiClient.post<UserResponse>("/auth/register", dto);
    return data;
  },
  /* ------------------- Products ------------------- */
  listProducts: async (
    params?: {
      search?: string;
      category?: string;
      status?: "active" | "inactive";
      low_stock_only?: boolean;
    } & PaginationParams
  ): Promise<{
    total: number;
    page: number;
    page_size: number;
    products: ProductResponse[];
  }> => {
    const res = await apiClient.get("/products", { params });
    return res.data;
  },

  createProduct: async (data: ProductCreateDto): Promise<ProductResponse> => {
    const res = await apiClient.post("/products", data);
    return res.data;
  },

  getCategories: async (): Promise<string[]> => {
    const res = await apiClient.get("/products/categories");
    return res.data;
  },

  getLowStock: async (): Promise<ProductResponse[]> => {
    const res = await apiClient.get("/products/low-stock");
    return res.data;
  },

  getActive: async (): Promise<ProductResponse[]> => {
    const res = await apiClient.get("/products/active");
    return res.data;
  },

  getProduct: async (product_id: UUID): Promise<ProductResponse> => {
    const res = await apiClient.get(`/products/${product_id}`);
    return res.data;
  },

  updateProduct: async (
    product_id: UUID,
    data: ProductUpdateDto
  ): Promise<ProductResponse> => {
    const res = await apiClient.put(`/products/${product_id}`, data);
    return res.data;
  },

  deleteProduct: async (product_id: UUID): Promise<void> => {
    await apiClient.delete(`/products/${product_id}`);
  },

  updateStock: async (
    product_id: UUID,
    data: ProductStockUpdateDto
  ): Promise<ProductResponse> => {
    const res = await apiClient.patch(`/products/${product_id}/stock`, data);
    return res.data;
  },

  /* ------------------- Sales ------------------- */
  listSales: async (
    params?: {
      product_id?: UUID;
      operator_id?: UUID;
      bill_id?: UUID;
      start_date?: string;
      end_date?: string;
    } & PaginationParams
  ): Promise<{
    total: number;
    page: number;
    page_size: number;
    sales: SaleResponse[];
  }> => {
    const res = await apiClient.get("/sales", { params });
    return res.data;
  },

  createSale: async (data: SaleCreateDto): Promise<SaleResponse> => {
    const res = await apiClient.post("/sales", data);
    return res.data;
  },

  getBill: async (bill_id: UUID): Promise<CheckoutResponse> => {
    const res = await apiClient.get(`/sales/bill/${bill_id}`);
    return res.data;
  },

  getSale: async (sale_id: UUID): Promise<SaleResponse> => {
    const res = await apiClient.get(`/sales/${sale_id}`);
    return res.data;
  },

  updateSale: async (
    sale_id: UUID,
    data: SaleUpdateDto
  ): Promise<SaleResponse> => {
    const res = await apiClient.put(`/sales/${sale_id}`, data);
    return res.data;
  },

  deleteSale: async (sale_id: UUID): Promise<void> => {
    await apiClient.delete(`/sales/${sale_id}`);
  },

  checkout: async (data: CheckoutDto): Promise<CheckoutResponse> => {
    const res = await apiClient.post("/sales/checkout", data);
    return res.data;
  },

  /* ------------------- Analytics ------------------- */
  dashboard: async (): Promise<DashboardStats> => {
    const res = await apiClient.get("/analytics/dashboard");
    return res.data;
  },

  salesOverview: async (params?: {
    start_date?: string;
    end_date?: string;
    period?: "day" | "week" | "month" | "year";
  }): Promise<any> => {
    const res = await apiClient.get("/analytics/sales-overview", {
      params,
    });
    return res.data;
  },

  topProducts: async (params?: {
    start_date?: string;
    end_date?: string;
    limit?: number;
  }): Promise<any> => {
    const res = await apiClient.get("/analytics/top-products", {
      params,
    });
    return res.data;
  },

  operatorPerformance: async (params?: {
    start_date?: string;
    end_date?: string;
    limit?: number;
  }): Promise<any> => {
    const res = await apiClient.get("/analytics/operator-performance", {
      params,
    });
    return res.data;
  },

  lowStockAlerts: async (): Promise<any> => {
    const res = await apiClient.get("/analytics/low-stock-alerts");
    return res.data;
  },

  /* ------------------- Health ------------------- */
  health: async (): Promise<{ status: string }> => {
    const res = await apiClient.get("/health");
    return res.data;
  },
};
