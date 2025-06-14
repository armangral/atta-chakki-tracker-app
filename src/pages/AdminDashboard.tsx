import { useState, useMemo } from "react";
import MainHeader from "@/components/Layout/MainHeader";
import ProductTable from "@/components/ProductTable";
import SalesTable from "@/components/SalesTable";
import LowStockAlert from "@/components/LowStockAlert";
import SalesChart from "@/components/SalesChart";

const MOCK_PRODUCTS = [
  { id: 1, name: "Sharbati Wheat Atta", category: "Flour", unit: "Kg", price: 42, stock: 14, lowStockThreshold: 15 },
  { id: 2, name: "Besan", category: "Flour", unit: "Kg", price: 80, stock: 40, lowStockThreshold: 10 },
  { id: 3, name: "Turmeric Powder", category: "Spices", unit: "Kg", price: 310, stock: 5, lowStockThreshold: 8 }
];

const MOCK_SALES = [
  { id: 1, productId: 1, productName: "Sharbati Wheat Atta", quantity: 5, total: 210, operator: "operator1", date: "2025-06-14 09:30" },
  { id: 2, productId: 2, productName: "Besan", quantity: 2.5, total: 200, operator: "operator2", date: "2025-06-14 10:05" }
];

export default function AdminDashboard() {
  const [products] = useState(MOCK_PRODUCTS);
  const [sales] = useState(MOCK_SALES);

  const todaySales = sales.reduce((acc, s) => acc + s.total, 0);
  const todayKg = sales.reduce((acc, s) => acc + s.quantity, 0);

  const lowStockProducts = products.filter(
    (p) => p.stock < p.lowStockThreshold
  );

  // Per-category breakdown (for today's sales only)
  const categoryStats = useMemo(() => {
    // Map from productId to category
    const idToCategory: Record<number, string> = {};
    products.forEach((p) => { idToCategory[p.id] = p.category; });

    // Aggregate sales for today per-category
    const categoryAgg: Record<string, { total: number; quantity: number; }> = {};
    sales.forEach((sale) => {
      const cat = idToCategory[sale.productId] || "Other";
      if (!categoryAgg[cat]) categoryAgg[cat] = { total: 0, quantity: 0 };
      categoryAgg[cat].total += sale.total;
      categoryAgg[cat].quantity += sale.quantity;
    });
    return categoryAgg;
  }, [sales, products]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-emerald-50 pb-20">
      <MainHeader userRole="admin" />
      <div className="max-w-6xl mx-auto px-4 pt-10">
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
            <div className="text-3xl font-extrabold text-emerald-700 mt-1">₨{todaySales}</div>
          </div>
          <div className="flex-1 rounded-xl shadow-md border border-gray-100 p-6 bg-white min-w-[230px]">
            <div className="text-gray-600 font-medium">Qty Sold (Today)</div>
            <div className="text-3xl font-extrabold text-gray-800 mt-1">{todayKg} Kg</div>
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
            <ProductTable products={products} />
          </div>
          <div>
            <SalesTable sales={sales} />
          </div>
        </div>
      </div>
    </div>
  );
}
