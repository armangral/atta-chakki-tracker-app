import { useState } from "react";
import BackButton from "@/components/BackButton";
import MainHeader from "@/components/Layout/MainHeader";
import SalesTableAdmin from "@/components/SalesTableAdmin";
import SaleFormDialog from "@/components/SaleFormDialog";
import { useSales, useDeleteSale } from "@/hooks/useSales";
import { useActiveProducts } from "@/hooks/useProducts";
import { useOperators } from "@/hooks/useUsers";

export default function AdminSales() {
  const [isOpen, setIsOpen] = useState(false);

  // Fetch data with React Query
  const {
    data: salesData,
    isLoading: salesLoading,
    error: salesError,
  } = useSales({
    page: 1,
    page_size: 100,
    sort_by: "date",
    sort_order: "desc",
  });

  const { data: products = [], isLoading: productsLoading } =
    useActiveProducts();
  const { data: operators = [], isLoading: operatorsLoading } = useOperators();

  const deleteSaleMutation = useDeleteSale();

  // Handle Sale Delete
  const handleDeleteSale = (id: string) => {
    if (window.confirm("Are you sure you want to delete this sale?")) {
      deleteSaleMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-emerald-50">
      <MainHeader userRole="admin" />
      <div className="max-w-6xl mx-auto px-4 pt-10">
        <BackButton />
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="text-2xl font-bold text-gray-800 mb-1">
              Sales Management
            </div>
            <div className="text-gray-500">
              View, add, and delete sales records
            </div>
          </div>
          <SaleFormDialog
            products={products}
            operators={operators}
            productsLoading={productsLoading}
            operatorsLoading={operatorsLoading}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
          />
        </div>
        <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
          <SalesTableAdmin
            sales={salesData?.sales || []}
            salesLoading={salesLoading}
            salesError={salesError}
            onDelete={handleDeleteSale}
            deletePending={deleteSaleMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
}
