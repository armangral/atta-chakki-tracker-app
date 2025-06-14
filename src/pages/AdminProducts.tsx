
import { useState, useMemo, useEffect } from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import BackButton from "@/components/BackButton";
import MainHeader from "@/components/Layout/MainHeader";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { TablesInsert, Tables } from "@/integrations/supabase/types";

// Product type from Supabase (id is uuid)
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

const unitOptions = ["Kg", "Gm", "Quintal", "Litre", "Unit"];

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<Omit<Product, "id">>({
    name: "",
    category: "",
    unit: "Kg",
    price: 0,
    stock: 0,
    low_stock_threshold: 1,
    status: "active",
  });

  // State for search input
  const [search, setSearch] = useState("");

  // Fetch all products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

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
      // Map status/low_stock_threshold
      const mapped = (data ?? []).map((p) => ({
        ...p,
        // status is TEXT but must always be "active" or "inactive"
        status: p.status === "active" ? "active" : "inactive",
      })) as Product[];
      setProducts(mapped);
    }
    setLoading(false);
  }

  // Filtered product list
  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const term = search.trim().toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)
    );
  }, [search, products]);

  // Handle input changes
  function handleFormChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "number" || name === "price" || name === "stock" || name === "low_stock_threshold"
          ? Number(value)
          : name === "status"
          ? (value as "active" | "inactive")
          : value,
    }));
  }

  // Open add product dialog
  function handleAdd() {
    setEditProduct(null);
    setForm({
      name: "",
      category: "",
      unit: "Kg",
      price: 0,
      stock: 0,
      low_stock_threshold: 1,
      status: "active",
    });
    setDialogOpen(true);
  }

  // Open edit product dialog
  function handleEdit(product: Product) {
    setEditProduct(product);
    setForm({
      name: product.name,
      category: product.category,
      unit: product.unit,
      price: product.price,
      stock: product.stock,
      low_stock_threshold: product.low_stock_threshold,
      status: product.status,
    });
    setDialogOpen(true);
  }

  // Submit add/edit form
  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.name.trim() === "" || form.category.trim() === "") {
      toast.error("Name and Category are required.");
      return;
    }
    if (form.price <= 0 || form.stock < 0 || form.low_stock_threshold < 0) {
      toast.error("Invalid price, stock or threshold value.");
      return;
    }
    if (editProduct) {
      // Edit product in DB
      const { error } = await supabase
        .from("products")
        .update({
          ...form,
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
      // Add
      const { data, error } = await supabase
        .from("products")
        .insert([
          {
            ...form,
            status: form.status,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select(); // So we can get the new id
      if (error) {
        toast.error("Failed to add product: " + error.message);
      } else {
        toast.success("Product added!");
        setDialogOpen(false);
        fetchProducts();
      }
    }
  }

  // Handle delete product
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

        <div className="bg-white rounded-xl shadow-md border border-gray-100 min-h-[350px]">
          {loading && (
            <div className="w-full py-12 flex justify-center items-center text-gray-500">
              Loading products...
            </div>
          )}
          {error && (
            <div className="w-full py-8 flex justify-center text-red-600">{error}</div>
          )}
          {!loading && !error && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Price (₨)</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Low Stock Threshold</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-400">
                      No products found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((p) => (
                    <TableRow key={p.id} className={p.status === "inactive" ? "opacity-60" : ""}>
                      <TableCell>
                        <span className={`font-semibold ${p.stock < p.low_stock_threshold ? "text-red-600" : ""}`}>
                          {p.name}
                        </span>
                      </TableCell>
                      <TableCell>{p.category}</TableCell>
                      <TableCell>{p.unit}</TableCell>
                      <TableCell>₨{p.price}</TableCell>
                      <TableCell>{p.stock}</TableCell>
                      <TableCell>{p.low_stock_threshold}</TableCell>
                      <TableCell>
                        {p.status === "active" ? (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full text-xs font-bold">
                            Inactive
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="flex gap-2 justify-center">
                        <Button variant="outline" size="icon" title="Edit" onClick={() => handleEdit(p)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="destructive" size="icon" title="Delete" onClick={() => handleDelete(p)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <form onSubmit={handleFormSubmit}>
            <DialogHeader>
              <DialogTitle>{editProduct ? "Edit Product" : "Add Product"}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 my-6">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  required
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  autoFocus
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  required
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleFormChange}
                />
              </div>
              <div>
                <Label htmlFor="unit">Unit</Label>
                <select
                  id="unit"
                  name="unit"
                  className="w-full border px-3 py-2 rounded-md"
                  value={form.unit}
                  onChange={handleFormChange}
                >
                  {unitOptions.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="price">Price (₨)</Label>
                <Input
                  required
                  id="price"
                  name="price"
                  type="number"
                  value={form.price}
                  min="1"
                  onChange={handleFormChange}
                />
              </div>
              <div>
                <Label htmlFor="stock">Stock</Label>
                <Input
                  required
                  id="stock"
                  name="stock"
                  type="number"
                  value={form.stock}
                  min="0"
                  onChange={handleFormChange}
                />
              </div>
              <div>
                <Label htmlFor="low_stock_threshold">Low Stock Threshold</Label>
                <Input
                  required
                  id="low_stock_threshold"
                  name="low_stock_threshold"
                  type="number"
                  value={form.low_stock_threshold}
                  min="0"
                  onChange={handleFormChange}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  className="w-full border px-3 py-2 rounded-md"
                  value={form.status}
                  onChange={handleFormChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full">
                {editProduct ? "Save Changes" : "Add Product"}
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
