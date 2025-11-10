export const QUERY_KEYS = {
  // Auth
  AUTH: {
    LOGIN: "login",
    SIGNUP: "signup",
    LOGOUT: "logout",
    PROFILE: "profile",
  },

  // Users
  USERS: {
    LIST: "users/list",
    DETAILS: (id: string | number) => ["users/details", id] as const,
    CREATE: "users/create",
    UPDATE: (id: string | number) => ["users/update", id] as const,
    DELETE: (id: string | number) => ["users/delete", id] as const,
  },

  // Products
  PRODUCTS: {
    LIST: "products/list",
    DETAILS: (id: string | number) => ["products/details", id] as const,
  },

  // Orders
  ORDERS: {
    LIST: "orders/list",
    DETAILS: (id: string | number) => ["orders/details", id] as const,
  },
} as const;
