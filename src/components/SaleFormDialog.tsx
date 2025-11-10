import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useCreateSale } from "@/hooks/useSales";
import { ProductResponse, UserResponse } from "@/services/attachakkiservice";
import { SaleFormData } from "@/types/sale";

type SaleFormDialogProps = {
  products: ProductResponse[];
  operators: UserResponse[];
  productsLoading: boolean;
  operatorsLoading: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const SaleFormDialog: React.FC<SaleFormDialogProps> = ({
  products,
  operators,
  productsLoading,
  operatorsLoading,
  isOpen,
  setIsOpen,
}) => {
  const [form, setForm] = useState<SaleFormData>({
    product_id: "",
    quantity: "",
    total: "",
    date: "",
  });

  const createSaleMutation = useCreateSale();

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setForm({
        product_id: "",
        quantity: "",
        total: "",
        date: new Date().toISOString().slice(0, 16), // Default to now
      });
    }
  }, [isOpen]);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.product_id || !form.quantity || !form.total || !form.date) {
      alert("Please fill in all sale details.");
      return;
    }

    try {
      await createSaleMutation.mutateAsync({
        product_id: form.product_id,
        quantity: parseFloat(form.quantity),
        total: parseFloat(form.total),
        date: new Date(form.date).toISOString(),
      });
      setIsOpen(false);
    } catch (error) {
      // Error is handled in the mutation hook
      console.error("Error creating sale:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2">
          <Plus size={18} /> Add Sale
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Sale</DialogTitle>
          <DialogDescription>
            Record a sale by filling in the details below.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4 mt-3" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1">Product</label>
            <select
              name="product_id"
              value={form.product_id}
              onChange={handleFormChange}
              className="w-full border rounded p-2"
              disabled={productsLoading || createSaleMutation.isPending}
              required
            >
              <option value="">Select</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} - ₨{parseFloat(p.price).toFixed(2)} per {p.unit}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Quantity Sold
            </label>
            <Input
              name="quantity"
              type="number"
              step="0.01"
              value={form.quantity}
              onChange={handleFormChange}
              placeholder="e.g. 2.5"
              disabled={createSaleMutation.isPending}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Total Amount (₨)
            </label>
            <Input
              name="total"
              type="number"
              step="0.01"
              value={form.total}
              onChange={handleFormChange}
              placeholder="e.g. 250"
              disabled={createSaleMutation.isPending}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Date &amp; Time
            </label>
            <Input
              name="date"
              type="datetime-local"
              value={form.date}
              onChange={handleFormChange}
              disabled={createSaleMutation.isPending}
              required
            />
          </div>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={createSaleMutation.isPending}>
              {createSaleMutation.isPending ? "Adding..." : "Add Sale"}
            </Button>
            <DialogClose asChild>
              <Button
                type="button"
                variant="secondary"
                disabled={createSaleMutation.isPending}
              >
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SaleFormDialog;
