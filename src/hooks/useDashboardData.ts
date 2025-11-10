import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { attaChakkiService } from "@/services/attachakkiservice";
import type {
  ProductResponse,
  SaleResponse,
  DashboardStats,
} from "@/services/attachakkiservice";

/* --------------------------------------------------------------- */
/*  Types – keep the same shape your UI expects                     */
/* --------------------------------------------------------------- */
type Product = ProductResponse & {
  // UI may still expect number for price/stock
  price: number;
  stock: number;
};

type Sale = SaleResponse & {
  quantity: number;
  total: number;
};

export type SaleTableRow = {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  total: number;
  operator: string;
  date: string;
  dateISO: string;
};

/* --------------------------------------------------------------- */
/*  Helper: Convert decimal strings → number                       */
/* --------------------------------------------------------------- */
const toNum = (val: string | number): number => {
  return typeof val === "string" ? parseFloat(val) || 0 : val;
};

/* --------------------------------------------------------------- */
/*  Main Hook                                                      */
/* --------------------------------------------------------------- */
export function useDashboardData() {
  /* ---------- 1. Dashboard Stats (fast summary) ---------- */
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: attaChakkiService.dashboard,
  });

  /* ---------- 2. Full Product List (for low-stock & categories) ---------- */
  const {
    data: productResp,
    isLoading: productsLoading,
    error: productsError,
  } = useQuery({
    queryKey: ["products", "all"],
    queryFn: () =>
      attaChakkiService.listProducts({
        page_size: 100, // fetch all (or paginate if you have >1000)
        status: "active",
      }),
  });

  const products: Product[] = useMemo(() => {
    return (
      productResp?.products?.map((p) => ({
        ...p,
        price: toNum(p.price),
        stock: p.stock,
      })) ?? []
    );
  }, [productResp]);

  /* ---------- 3. Today’s Sales (server-filtered) ---------- */
  const today = new Date().toISOString().slice(0, 10);
  const {
    data: salesResp,
    isLoading: salesLoading,
    error: salesError,
  } = useQuery({
    queryKey: ["sales", "today", today],
    queryFn: () =>
      attaChakkiService.listSales({
        start_date: `${today}T00:00:00`,
        end_date: `${today}T23:59:59`,
        page_size: 100,
      }),
  });

  const sales: Sale[] = useMemo(() => {
    return (
      salesResp?.sales?.map((s) => ({
        ...s,
        quantity: toNum(s.quantity),
        total: toNum(s.total),
      })) ?? []
    );
  }, [salesResp]);

  /* ---------- 4. Today Aggregates (from stats or manual) ---------- */
  const todaySales = stats?.today_revenue ? toNum(stats.today_revenue) : 0;
  const todayKg = sales.reduce((sum, s) => sum + s.quantity, 0);

  /* ---------- 5. Low Stock (use API or compute) ---------- */
  const lowStockProducts = useMemo(() => {
    return products
      .filter((p) => p.stock < p.low_stock_threshold)
      .map((p) => ({
        id: uuidToNumber(p.id),
        name: p.name,
        unit: p.unit,
        stock: p.stock,
        lowStockThreshold: p.low_stock_threshold,
      }));
  }, [products]);

  /* ---------- 6. Category Stats for Today ---------- */
  const categoryStats = useMemo(() => {
    const idToCategory: Record<string, string> = {};
    products.forEach((p) => {
      idToCategory[p.id] = p.category;
    });

    const agg: Record<string, { total: number; quantity: number }> = {};
    sales.forEach((sale) => {
      const cat = idToCategory[sale.product_id] || "Other";
      if (!agg[cat]) agg[cat] = { total: 0, quantity: 0 };
      agg[cat].total += sale.total;
      agg[cat].quantity += sale.quantity;
    });
    return agg;
  }, [sales, products]);

  /* ---------- 7. Table Rows (same format) ---------- */
  const salesForTable: SaleTableRow[] = useMemo(() => {
    return sales.map((s) => {
      const dateISO = s.date;
      return {
        id: uuidToNumber(s.id),
        productId: uuidToNumber(s.product_id),
        productName: s.product_name,
        quantity: s.quantity,
        total: s.total,
        operator: s.operator_name,
        date: dateISO ? new Date(dateISO).toLocaleString() : "",
        dateISO,
      };
    });
  }, [sales]);

  /* ---------- Return everything UI needs ---------- */
  return {
    // Stats
    stats,
    statsLoading,
    statsError,

    // Products
    products,
    productsLoading,
    productsError,

    // Sales
    sales,
    salesLoading,
    salesError,

    // Aggregates
    todaySales,
    todayKg,
    lowStockProducts,
    categoryStats,
    salesForTable,
  };
}

/* --------------------------------------------------------------- */
/*  Helper: Convert UUID → short number (for tables)               */
/* --------------------------------------------------------------- */
function uuidToNumber(uuid: string): number {
  const clean = uuid.replace(/-/g, "").slice(0, 8);
  return Math.abs(parseInt(clean, 16));
}
