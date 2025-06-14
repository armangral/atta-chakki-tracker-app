
import { useState, useEffect, useMemo } from "react";
import BackButton from "@/components/BackButton";
import MainHeader from "@/components/Layout/MainHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import ProductTable from "@/components/ProductTable";
import ProductFormDialog from "@/components/ProductFormDialog";

// Product type from Supabase
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

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  // Fetch products
  async function fetchProducts() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      setError("Could not load products: " + error.message);
    } else {
      const mapped = (data ?? []).map((p) => ({
        ...p,
        status: p.status === "active" ? "active" : "inactive",
      })) as Product[];
      setProducts(mapped);
    }
    setLoading(false);
  }
  useEffect(() => {
    fetchProducts();
  }, []);

  // Filtered products
  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const term = search.trim().toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)
    );
  }, [search, products]);

  function handleAdd() {
    setEditProduct(null);
    setDialogOpen(true);
  }

  function handleEdit(product: Product) {
    setEditProduct(product);
    setDialogOpen(true);
  }

  async function handleDelete(product: Product) {
    if (
      window.confirm(
        `Are you sure you want to delete the product "${product.name}"?`
      )
    ) {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id);
      if (error) {
        toast.error("Failed to delete product: " + error.message);
      } else {
        toast.success("Product deleted.");
        fetchProducts();
      }
    }
  }

  async function handleSubmit(
    values: Omit<Product, "id" | "created_at" | "updated_at">,
    isEdit: boolean
  ) {
    if (isEdit && editProduct) {
      const { error } = await supabase
        .from("products")
        .update({
          ...values,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editProduct.id);
      if (error) {
        toast.error("Failed to update product: " + error.message);
      } else {
        toast.success("Product updated!");
        setDialogOpen(false);
        fetchProducts();
      }
    } else {
      const { error } = await supabase
        .from("products")
        .insert([
          {
            ...values,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);
      if (error) {
        toast.error("Failed to add product: " + error.message);
      } else {
        toast.success("Product added!");
        setDialogOpen(false);
        fetchProducts();
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-emerald-50">
      <MainHeader userRole="admin" />
      <div className="max-w-5xl mx-auto px-4 py-10">
        <BackButton />
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div className="text-2xl font-black tracking-wide text-amber-700">
            Product Management
          </div>
          <div className="flex gap-2 items-center w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Input
                type="text"
                placeholder="Search products…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-3 bg-white shadow border focus:ring-amber-400 focus:border-amber-500"
              />
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                size={18}
              />
            </div>
            <Button onClick={handleAdd} className="gap-2 whitespace-nowrap" variant="outline">
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </div>
        </div>
        <ProductTable
          loading={loading}
          error={error}
          products={filteredProducts}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
      <ProductFormDialog
        open={dialogOpen}
        setOpen={setDialogOpen}
        product={editProduct}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
