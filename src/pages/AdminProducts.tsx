import { useState, useMemo } from "react";
import BackButton from "@/components/BackButton";
import MainHeader from "@/components/Layout/MainHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import ProductTable from "@/components/ProductTable";
import ProductFormDialog from "@/components/ProductFormDialog";
import { useProducts, useDeleteProduct } from "@/hooks/useProducts";
import { Product, ProductFormData } from "@/types/product";

export default function AdminProducts() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  // Fetch products with React Query
  const { data, isLoading, error } = useProducts({
    page: 1,
    page_size: 100,
    sort_by: "name",
    sort_order: "asc",
  });

  const deleteProductMutation = useDeleteProduct();

  // Filtered products
  const filteredProducts = useMemo(() => {
    if (!data?.products) return [];
    if (!search.trim()) return data.products;

    const term = search.trim().toLowerCase();
    return data.products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)
    );
  }, [search, data?.products]);

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
      deleteProductMutation.mutate(product.id);
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
            <Button
              onClick={handleAdd}
              className="gap-2 whitespace-nowrap"
              variant="outline"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </div>
        </div>
        <ProductTable
          loading={isLoading}
          error={error ? "Failed to load products" : null}
          products={filteredProducts}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
      <ProductFormDialog
        open={dialogOpen}
        setOpen={setDialogOpen}
        product={editProduct}
      />
    </div>
  );
}
