
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import BackButton from "@/components/BackButton";
import MainHeader from "@/components/Layout/MainHeader";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="gap-2">
                <Plus size={18}/> Add Sale
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Sale</DialogTitle>
                <DialogDescription>Record a sale by filling in the details below.</DialogDescription>
              </DialogHeader>
              <form
                className="space-y-4 mt-3"
                onSubmit={e => {
                  e.preventDefault();
                  handleAddSale();
                }}
              >
                <div>
                  <label className="block text-sm font-medium mb-1">Product</label>
                  <select
                    name="product_id"
                    value={form.product_id}
                    onChange={handleFormChange}
                    className="w-full border rounded p-2"
                    disabled={productsLoading}
                  >
                    <option value="">Select</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity Sold (Kg/Ltrs)</label>
                  <Input name="quantity" type="number" step={0.01} value={form.quantity} onChange={handleFormChange} placeholder="e.g. 2.5" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Total Amount (₨)</label>
                  <Input name="total" type="number" step={0.01} value={form.total} onChange={handleFormChange} placeholder="e.g. 250" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Operator</label>
                  <select
                    name="operator_id"
                    value={form.operator_id}
                    onChange={handleFormChange}
                    className="w-full border rounded p-2"
                    disabled={operatorsLoading}
                  >
                    <option value="">Select</option>
                    {operators.map((op) => (
                      <option key={op.id} value={op.id}>{op.username}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date &amp; Time</label>
                  <Input name="date" type="datetime-local" value={form.date} onChange={handleFormChange} />
                </div>
                <DialogFooter className="mt-4">
                  <Button type="submit" disabled={addSaleMutation.isPending}>Add Sale</Button>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                  </DialogClose>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
          {salesLoading ? (
            <div className="py-10 text-center text-gray-400">Loading sales...</div>
          ) : salesError ? (
            <div className="py-10 text-center text-red-500">
              Could not fetch sales.<br />
              <span className="text-xs">{String(salesError)}</span>
            </div>
          ) : sales.length === 0 ? (
            <div className="px-3 py-8 italic text-gray-400 text-center">
              No sales records.
            </div>
          ) : (
            <table className="w-full border rounded-md overflow-hidden bg-white">
              <thead className="bg-emerald-50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 text-sm">Date/Time</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 text-sm">Product</th>
                  <th className="px-3 py-2 text-right font-semibold text-gray-700 text-sm">Qty</th>
                  <th className="px-3 py-2 text-right font-semibold text-gray-700 text-sm">Total</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 text-sm">Operator</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-600 text-sm">Action</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => (
                  <tr key={s.id} className="group">
                    <td className="px-3 py-2">{new Date(s.date).toLocaleString()}</td>
                    <td className="px-3 py-2">{s.product_name}</td>
                    <td className="px-3 py-2 text-right">{s.quantity}</td>
                    <td className="px-3 py-2 text-right">₨{s.total}</td>
                    <td className="px-3 py-2">{s.operator_name}</td>
                    <td className="px-3 py-2 text-center">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-red-600 hover:bg-red-100"
                        onClick={() => handleDeleteSale(s.id)}
                        title="Delete sale"
                        disabled={deleteSaleMutation.isPending}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
