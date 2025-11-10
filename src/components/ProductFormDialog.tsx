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
import { useCreateProduct, useUpdateProduct } from "@/hooks/useProducts";
import { Product, ProductFormData } from "@/types/product";

const unitOptions = ["Kg", "Gm", "Quintal", "Litre", "Unit"];

export default function ProductFormDialog({
  open,
  setOpen,
  product,
}: {
  open: boolean;
  setOpen: (val: boolean) => void;
  product: Product | null;
}) {
  const [form, setForm] = useState<ProductFormData>({
    name: "",
    category: "",
    unit: "Kg",
    price: 0,
    stock: 0,
    low_stock_threshold: 10,
    status: "active",
  });

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  const isEdit = !!product;
  const isLoading =
    createProductMutation.isPending || updateProductMutation.isPending;

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        category: product.category,
        unit: product.unit,
        price: parseFloat(product.price), // Convert string to number
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
        low_stock_threshold: 10,
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
        type === "number" ||
        name === "price" ||
        name === "stock" ||
        name === "low_stock_threshold"
          ? Number(value)
          : name === "status"
          ? (value as "active" | "inactive")
          : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (form.name.trim() === "" || form.category.trim() === "") {
      alert("Name and Category are required.");
      return;
    }
    if (form.price <= 0 || form.stock < 0 || form.low_stock_threshold < 0) {
      alert("Invalid price, stock or threshold value.");
      return;
    }

    try {
      if (isEdit && product) {
        await updateProductMutation.mutateAsync({
          id: product.id,
          data: form,
        });
      } else {
        await createProductMutation.mutateAsync(form);
      }
      setOpen(false);
    } catch (error) {
      // Error is handled in the mutation hooks
      console.error("Error submitting form:", error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Product" : "Add Product"}</DialogTitle>
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
                disabled={isLoading}
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
                disabled={isLoading}
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
                disabled={isLoading}
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
                step="0.01"
                value={form.price}
                min="0.01"
                onChange={handleFormChange}
                disabled={isLoading}
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
                disabled={isLoading}
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
                disabled={isLoading}
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
                disabled={isLoading}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? "Saving..."
                : isEdit
                ? "Save Changes"
                : "Add Product"}
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isLoading}>
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
