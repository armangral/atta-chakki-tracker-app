
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import BackButton from "@/components/BackButton";
import MainHeader from "@/components/Layout/MainHeader";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SalesTableAdmin from "@/components/SalesTableAdmin";
import SaleFormDialog from "@/components/SaleFormDialog";

// Type definitions
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

type Product = {
  id: string;
  name: string;
};

type Operator = {
  id: string;
  username: string | null;
};

export default function AdminSales() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch products for select dropdown
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id,name")
        .order("name", { ascending: true });
      if (error) throw error;
      return data as Product[];
    }
  });

  // Fetch operators for select dropdown
  const { data: operators = [], isLoading: operatorsLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id,username")
        .order("username", { ascending: true });
      if (error) throw error;
      return data as Operator[];
    }
  });

  // Fetch all sales
  const { data: sales = [], isLoading: salesLoading, error: salesError } = useQuery({
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

  // Add Sale form state
  const [form, setForm] = useState({
    product_id: "",
    quantity: "",
    total: "",
    operator_id: "",
    date: "",
  });

  // Handle Form Changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add sale mutation
  const addSaleMutation = useMutation({
    mutationFn: async (formData: typeof form) => {
      const product = products.find(p => p.id === formData.product_id);
      const operator = operators.find(o => o.id === formData.operator_id);

      if (!product || !operator) throw new Error("Invalid product or operator");

      const { error } = await supabase.from("sales").insert([
        {
          product_id: product.id,
          product_name: product.name,
          quantity: parseFloat(formData.quantity),
          total: parseFloat(formData.total),
          operator_id: operator.id,
          operator_name: operator.username || "",
          date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString()
        }
      ]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Sale recorded" });
      setIsOpen(false);
      setForm({
        product_id: "",
        quantity: "",
        total: "",
        operator_id: "",
        date: "",
      });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
    onError: err => {
      toast({ title: "Failed to add sale", description: String(err) });
    }
  });

  // Delete sale mutation
  const deleteSaleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sales").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Sale deleted" });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
    onError: err => {
      toast({ title: "Failed to delete sale", description: String(err) });
    }
  });

  // Handle Sale Add
  const handleAddSale = () => {
    if (!form.product_id || !form.quantity || !form.total || !form.operator_id || !form.date) {
      toast({ title: "Incomplete fields", description: "Please fill in all sale details." });
      return;
    }
    addSaleMutation.mutate(form);
  };

  // Handle Sale Delete
  const handleDeleteSale = (id: string) => {
    deleteSaleMutation.mutate(id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-emerald-50">
      <MainHeader userRole="admin" />
      <div className="max-w-6xl mx-auto px-4 pt-10">
        <BackButton />
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="text-2xl font-bold text-gray-800 mb-1">Sales Management</div>
            <div className="text-gray-500">View, add, and delete sales records</div>
          </div>
          <SaleFormDialog
            products={products}
            operators={operators}
            productsLoading={productsLoading}
            operatorsLoading={operatorsLoading}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            form={form}
            onFormChange={handleFormChange}
            onSubmit={handleAddSale}
            isSubmitting={addSaleMutation.isPending}
          />
        </div>
        <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
          <SalesTableAdmin
            sales={sales}
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
