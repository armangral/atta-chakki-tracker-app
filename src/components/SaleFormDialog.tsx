
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import React from "react";

type Product = {
  id: string;
  name: string;
};

type Operator = {
  id: string;
  username: string | null;
};

type SaleFormState = {
  product_id: string;
  quantity: string;
  total: string;
  operator_id: string;
  date: string;
};

type SaleFormDialogProps = {
  products: Product[];
  operators: Operator[];
  productsLoading: boolean;
  operatorsLoading: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  form: SaleFormState;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
};

const SaleFormDialog: React.FC<SaleFormDialogProps> = ({
  products,
  operators,
  productsLoading,
  operatorsLoading,
  isOpen,
  setIsOpen,
  form,
  onFormChange,
  onSubmit,
  isSubmitting,
}) => (
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
          onSubmit();
        }}
      >
        <div>
          <label className="block text-sm font-medium mb-1">Product</label>
          <select
            name="product_id"
            value={form.product_id}
            onChange={onFormChange}
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
          <Input name="quantity" type="number" step={0.01} value={form.quantity} onChange={onFormChange} placeholder="e.g. 2.5" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Total Amount (₨)</label>
          <Input name="total" type="number" step={0.01} value={form.total} onChange={onFormChange} placeholder="e.g. 250" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Operator</label>
          <select
            name="operator_id"
            value={form.operator_id}
            onChange={onFormChange}
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
          <Input name="date" type="datetime-local" value={form.date} onChange={onFormChange} />
        </div>
        <DialogFooter className="mt-4">
          <Button type="submit" disabled={isSubmitting}>Add Sale</Button>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
);

export default SaleFormDialog;
