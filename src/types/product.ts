// src/types/product.ts
export type Product = {
  id: string;
  name: string;
  category: string;
  unit: string;
  price: string; // API returns as string
  stock: number;
  low_stock_threshold: number;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
  is_low_stock: boolean;
};

export type ProductFormData = {
  name: string;
  category: string;
  unit: string;
  price: number;
  stock: number;
  low_stock_threshold: number;
  status: "active" | "inactive";
};
