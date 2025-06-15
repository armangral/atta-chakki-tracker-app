
/**
 * Shared types between Operator POS components/pages.
 */

export type Product = {
  id: string; // UUID from Supabase
  name: string;
  price: number;
  stock: number;
  unit: string;
  category: string;
};

export type Sale = {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  total: number;
  operator_id: string;
  operator_name: string;
  date: string;
  bill_id: string | null;
};
