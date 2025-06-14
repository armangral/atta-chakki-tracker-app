import { useMemo } from "react";
import MainHeader from "@/components/Layout/MainHeader";
import ProductTable from "@/components/ProductTable";
import SalesTable from "@/components/SalesTable";
import LowStockAlert from "@/components/LowStockAlert";
import SalesChart from "@/components/SalesChart";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/components/ui/sonner";
// 👇 Import the Sale type as SaleTableRow to avoid collision
import type { default as SalesTableComponent } from "@/components/SalesTable";
type SaleTableRow = Parameters<typeof SalesTableComponent>[0]["sales"][number];

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

// Add this type for mapping to SalesTable
type SaleForTable = {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  total: number;
  operator: string;
  date: string;
};

import CategoryStatsCard from "@/components/dashboard/CategoryStatsCard";
import DashboardStatCard from "@/components/dashboard/DashboardStatCard";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function AdminDashboard() {
  const {
    products,
    productsLoading,
    productsError,
    sales,
    salesLoading,
    salesError,
    todaySales,
    todayKg,
    lowStockProducts,
    categoryStats,
    salesForTable,
  } = useDashboardData();

  // Handlers
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
        <CategoryStatsCard
          stats={Object.entries(categoryStats).map(([category, stat]) => ({
            category,
            total: stat.total,
            quantity: stat.quantity,
          }))}
        />

        {/* Top stats */}
        <div className="flex flex-wrap gap-6 mb-8">
          <DashboardStatCard
            title="Total Sales (Today)"
            value={`₨${todaySales}`}
            loading={salesLoading}
            color="text-emerald-700"
          />
          <DashboardStatCard
            title="Qty Sold (Today)"
            value={`${todayKg} Kg`}
            loading={salesLoading}
          />
          <DashboardStatCard title={<span className="text-red-700">Low Stock</span>}>
            <LowStockAlert products={lowStockProducts} />
          </DashboardStatCard>
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
            <SalesTable sales={salesForTable} />
          </div>
        </div>
      </div>
    </div>
  );
}
