
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

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

type ProductFormFields = Omit<Product, "id" | "created_at" | "updated_at">;

export default function ProductFormDialog({
  open,
  setOpen,
  product,
  onSubmit,
}: {
  open: boolean;
  setOpen: (val: boolean) => void;
  product: Product | null;
  onSubmit: (values: ProductFormFields, isEdit: boolean) => void;
}) {
  const [form, setForm] = useState<ProductFormFields>({
    name: "",
    category: "",
    unit: "Kg",
    price: 0,
    stock: 0,
    low_stock_threshold: 1,
    status: "active",
  });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        category: product.category,
        unit: product.unit,
        price: product.price,
        stock: product.stock,
        low_stock_threshold: product.low_stock_threshold,
        status: product.status,
      });
    } else {
      setForm({
        name: "",
        category: "",
        unit: "Kg",
        price: 0,
        stock: 0,
        low_stock_threshold: 1,
        status: "active",
      });
    }
  }, [product, open]);

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.name.trim() === "" || form.category.trim() === "") {
      // Prefer using shadcn toast, but fallback to alert for visibility on modal
      alert("Name and Category are required.");
      return;
    }
    if (form.price <= 0 || form.stock < 0 || form.low_stock_threshold < 0) {
      alert("Invalid price, stock or threshold value.");
      return;
    }
    onSubmit(form, !!product);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{product ? "Edit Product" : "Add Product"}</DialogTitle>
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
              {product ? "Save Changes" : "Add Product"}
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
  );
}
