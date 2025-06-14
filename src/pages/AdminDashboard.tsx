
import { useState } from "react";
import MainHeader from "@/components/Layout/MainHeader";
import ProductTable from "@/components/ProductTable";
import SalesTable from "@/components/SalesTable";
import LowStockAlert from "@/components/LowStockAlert";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-emerald-50 pb-20">
      <MainHeader userRole="admin" />
      <div className="max-w-6xl mx-auto px-4 pt-10">
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
