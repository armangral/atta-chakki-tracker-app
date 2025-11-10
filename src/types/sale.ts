// src/types/sale.ts
import { UUID } from "@/services/attachakkiservice";

export type Sale = {
  id: UUID;
  product_id: UUID;
  product_name: string;
  quantity: string; // decimal string from API
  total: string; // decimal string from API
  date: string;
  operator_id: UUID;
  operator_name: string;
  bill_id: UUID;
};

export type SaleFormData = {
  product_id: string;
  quantity: string;
  total: string;
  date: string;
};
