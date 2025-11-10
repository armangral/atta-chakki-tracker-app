export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    me: "/users/me",
    verifyEmail: "/auth/verify-email",
    resendVerification: "/auth/resend-verification",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    updatePassword: "/auth/update-password",
    checkPassword: "/auth/check-password",
  },
  comments: {
    list: "/posts", // GET /comments/post/:postId
    create: "/posts", // POST /comments/post/:postId
    delete: "/comments", // DELETE /comments/:commentId
  },
  user: {
    profile: "/user/profile",
    updateProfile: "/users",
  },
  categories: {
    list: "/categories/",
    getById: "/categories/",
    create: "/categories/admin/",
    update: "/categories/admin",
    delete: "/categories/admin",
  },
  states: {
    list: "/states/",
    getById: "/states/",
    create: "/states/admin/",
    update: "/states/admin",
    delete: "/states/admin",
  },
  posts: {
    list: "/posts/admin/all",
    create: "/posts/",
    getById: "/posts",
    update: "/posts/admin",
    delete: "/posts",
    approve: "/posts/admin",
    my: "/posts/me",
    upvote: "/posts",
  },
  company: {
    create: "/company",
    list: "/company",
    update: "/company",
    delete: "/company",
    stats: "/company/stats",
  },
  // ✅ New payment endpoints
  payments: {
    // Subscription plans
    plans: "/payments/plans",
    transactions: "/payments/transactions",

    // Checkout & Portal
    createCheckout: "/payments/create-checkout-session",
    createPortal: "/subscriptions/create-billing-portal-session",

    // Subscription management
    subscription: "/subscriptions/subscription",
    cancelSubscription: "/subscriptions/subscription/cancel",
    resumeSubscription: "/subscriptions/subscription/resume",
    updatePlan: "/subscriptions/subscription/update-plan",

    // Billing & History
    history: "/subscriptions/history",
    invoicePreview: "/subscriptions/invoice-preview",

    // Usage & Stats
    usage: "/subscriptions/usage",

    // Coupons
    applyCoupon: "/subscriptions/coupon/apply",
    removeCoupon: "/subscriptions/coupon/remove",

    // Webhooks (if needed for client-side validation)
    webhookStatus: "/subscriptions/webhook/status",
  },

  contact: {
    submit: "/auth/send-contact-email",
  },
  // Other features...
} as const;
