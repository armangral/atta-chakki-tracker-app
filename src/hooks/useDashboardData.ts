
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type Product = {
  id: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  stock: number;
  low_stock_threshold: number;
  status: "active" | "inactive";
  created_at?: string | null;
  updated_at?: string | null;
};

type Sale = {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  total: number;
  operator_id: string;
  operator_name: string;
  date: string;
  created_at: string | null;
};

export function useDashboardData() {
  // Products data
  const {
    data: products = [],
    isLoading: productsLoading,
    error: productsError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((p) => ({
        ...p,
        status: p.status === "active" ? "active" : "inactive",
      })) as Product[];
    }
  });

  // Sales data
  const {
    data: sales = [],
    isLoading: salesLoading,
    error: salesError,
  } = useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return data as Sale[];
    }
  });

  // Today's date and sales
  const today = new Date().toISOString().slice(0, 10);
  const todaySalesList = sales.filter((s) =>
    s.date && s.date.slice(0, 10) === today
  );

  const todaySales = todaySalesList.reduce((acc, s) => acc + (typeof s.total === 'number' ? s.total : 0), 0);
  const todayKg = todaySalesList.reduce((acc, s) => acc + (typeof s.quantity === 'number' ? s.quantity : 0), 0);

  // Low stock products
  const lowStockProducts = products
    .filter((p) => p.stock < p.low_stock_threshold)
    .map((p) => ({
      id: Number(typeof p.id === "string" ? p.id.replace(/-/g, "").slice(0, 8) : p.id),
      name: p.name,
      unit: p.unit,
      stock: p.stock,
      lowStockThreshold: p.low_stock_threshold,
    }));

  // Category stats for today
  const categoryStats = useMemo(() => {
    const idToCategory: Record<string, string> = {};
    products.forEach((p) => { idToCategory[p.id] = p.category; });

    const categoryAgg: Record<string, { total: number; quantity: number; }> = {};
    todaySalesList.forEach((sale) => {
      const cat = idToCategory[sale.product_id] || "Other";
      if (!categoryAgg[cat]) categoryAgg[cat] = { total: 0, quantity: 0 };
      categoryAgg[cat].total += typeof sale.total === "number" ? sale.total : 0;
      categoryAgg[cat].quantity += typeof sale.quantity === "number" ? sale.quantity : 0;
    });
    return categoryAgg;
  }, [todaySalesList, products]);

  // Map sales for table (type matches SalesTable)
  type SaleTableRow = {
    id: number;
    productId: number;
    productName: string;
    quantity: number;
    total: number;
    operator: string;
    date: string;
  };
  const salesForTable: SaleTableRow[] = sales.map((s) => ({
    id: typeof s.id === "string" ? Math.abs(
      parseInt(s.id.replace(/-/g, "").slice(0, 8), 16)
    ) : Number(s.id),
    productId: typeof s.product_id === "string" ? Math.abs(
      parseInt(s.product_id.replace(/-/g, "").slice(0, 8), 16)
    ) : Number(s.product_id),
    productName: s.product_name,
    quantity: Number(s.quantity),
    total: Number(s.total),
    operator: s.operator_name,
    date: s.date ? new Date(s.date).toLocaleString() : "",
  }));

  return {
    products, productsLoading, productsError,
    sales, salesLoading, salesError,
    todaySales, todayKg, lowStockProducts, categoryStats, salesForTable,
  };
}
