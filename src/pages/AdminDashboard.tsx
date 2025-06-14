
import { useMemo } from "react";
import MainHeader from "@/components/Layout/MainHeader";
import ProductTable from "@/components/ProductTable";
import SalesTable from "@/components/SalesTable";
import LowStockAlert from "@/components/LowStockAlert";
import SalesChart from "@/components/SalesChart";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/components/ui/sonner";

// Type definitions matching your database
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

export default function AdminDashboard() {
  // Fetch products from Supabase
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

  // Fetch sales from Supabase
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

  // Totals/statistics for today (using sales)
  // Use system date for "today" filtering
  const today = new Date().toISOString().slice(0, 10);
  const todaySalesList = sales.filter((s) =>
    s.date && s.date.slice(0, 10) === today
  );

  const todaySales = todaySalesList.reduce((acc, s) => acc + (typeof s.total === 'number' ? s.total : 0), 0);
  const todayKg = todaySalesList.reduce((acc, s) => acc + (typeof s.quantity === 'number' ? s.quantity : 0), 0);

  // ProductTable expects: ... low_stock_threshold ...
  // LowStockAlert expects: id: number, lowStockThreshold: number, unit, name, stock
  const lowStockProducts = products
    .filter((p) => p.stock < p.low_stock_threshold)
    .map((p) => ({
      id: Number(typeof p.id === "string" ? p.id.replace(/-/g, "").slice(0, 8) : p.id), // fallback for uuid num values, unique
      name: p.name,
      unit: p.unit,
      stock: p.stock,
      lowStockThreshold: p.low_stock_threshold,
    }));

  // Per-category breakdown (for today's sales)
  const categoryStats = useMemo(() => {
    // Map from productId to category (productId is string)
    const idToCategory: Record<string, string> = {};
    products.forEach((p) => { idToCategory[p.id] = p.category; });

    // Aggregate sales for today per-category
    const categoryAgg: Record<string, { total: number; quantity: number; }> = {};
    todaySalesList.forEach((sale) => {
      const cat = idToCategory[sale.product_id] || "Other";
      if (!categoryAgg[cat]) categoryAgg[cat] = { total: 0, quantity: 0 };
      categoryAgg[cat].total += typeof sale.total === "number" ? sale.total : 0;
      categoryAgg[cat].quantity += typeof sale.quantity === "number" ? sale.quantity : 0;
    });
    return categoryAgg;
  }, [todaySalesList, products]);

  // Edit/Delete handlers are not functional here -- handled on /AdminProducts
  const handleEdit = () => {};
  const handleDelete = () => {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-emerald-50 pb-20">
      <MainHeader userRole="admin" />
      <div className="max-w-6xl mx-auto px-4 pt-10">
        {/* Show errors if any */}
        {(productsError || salesError) && (
          <div className="mb-4 text-red-600 bg-red-50 p-3 rounded shadow">
            {productsError && <div>Products error: {String(productsError)}</div>}
            {salesError && <div>Sales error: {String(salesError)}</div>}
          </div>
        )}
        {/* Per-category sales summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {Object.entries(categoryStats).map(([category, stat]) => (
            <div
              key={category}
              className="flex flex-col items-start p-4 rounded-xl shadow border bg-white"
            >
              <span className="text-md font-semibold text-gray-500">{category}</span>
              <span className="text-lg font-bold text-emerald-700">
                ₨{stat.total.toLocaleString()} &middot; {stat.quantity} units
              </span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-6 mb-8">
          <div className="flex-1 rounded-xl shadow-md border border-gray-100 p-6 bg-white min-w-[230px]">
            <div className="text-gray-600 font-medium">Total Sales (Today)</div>
            {salesLoading ? (
              <div className="text-xl text-gray-400 mt-1">Loading...</div>
            ) : (
              <div className="text-3xl font-extrabold text-emerald-700 mt-1">₨{todaySales}</div>
            )}
          </div>
          <div className="flex-1 rounded-xl shadow-md border border-gray-100 p-6 bg-white min-w-[230px]">
            <div className="text-gray-600 font-medium">Qty Sold (Today)</div>
            {salesLoading ? (
              <div className="text-xl text-gray-400 mt-1">Loading...</div>
            ) : (
              <div className="text-3xl font-extrabold text-gray-800 mt-1">{todayKg} Kg</div>
            )}
          </div>
          <div className="flex-1 rounded-xl shadow-md border border-gray-100 p-6 bg-white min-w-[230px]">
            <LowStockAlert products={lowStockProducts} />
          </div>
        </div>
        <div className="mb-10">
          <SalesChart sales={sales} />
        </div>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <ProductTable
              products={products}
              loading={productsLoading}
              error={productsError ? String(productsError) : null}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
          <div>
            <SalesTable sales={sales} />
          </div>
        </div>
      </div>
    </div>
  );
}
