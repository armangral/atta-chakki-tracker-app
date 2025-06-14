
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

const MOCK_PRODUCTS = [
  { id: 1, name: "Sharbati Wheat Atta" },
  { id: 2, name: "Besan" },
  { id: 3, name: "Turmeric Powder" },
];

const MOCK_OPERATORS = [
  { id: 1, name: "operator1" },
  { id: 2, name: "operator2" },
];

type Sale = {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  total: number;
  operator: string;
  date: string;
};

const INITIAL_SALES: Sale[] = [
  { id: 1, productId: 1, productName: "Sharbati Wheat Atta", quantity: 5, total: 210, operator: "operator1", date: "2025-06-14 09:30" },
  { id: 2, productId: 2, productName: "Besan", quantity: 2.5, total: 200, operator: "operator2", date: "2025-06-14 10:05" }
];

export default function AdminSales() {
  const [sales, setSales] = useState<Sale[]>(INITIAL_SALES);
  const [isOpen, setIsOpen] = useState(false);

  // Add Sale form state
  const [form, setForm] = useState({
    productId: "",
    quantity: "",
    total: "",
    operator: "",
    date: "",
  });

  // Handle Form Changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle Sale Add
  const handleAddSale = () => {
    if (!form.productId || !form.quantity || !form.total || !form.operator || !form.date) {
      toast({ title: "Incomplete fields", description: "Please fill in all sale details." });
      return;
    }
    const prod = MOCK_PRODUCTS.find(p => p.id === Number(form.productId));
    if (!prod) {
      toast({ title: "Invalid product!" });
      return;
    }
    const newSale: Sale = {
      id: Math.max(...sales.map(s => s.id)) + 1,
      productId: Number(form.productId),
      productName: prod.name,
      quantity: parseFloat(form.quantity),
      total: parseFloat(form.total),
      operator: form.operator,
      date: form.date
    };
    setSales(prev => [newSale, ...prev]);
    setForm({
      productId: "",
      quantity: "",
      total: "",
      operator: "",
      date: "",
    });
    setIsOpen(false);
    toast({ title: "Sale recorded" });
  };

  // Handle Sale Delete
  const handleDeleteSale = (id: number) => {
    setSales(prev => prev.filter(s => s.id !== id));
    toast({ title: "Sale deleted" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-emerald-50 pb-20">
      <div className="max-w-6xl mx-auto px-4 pt-10">
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
                    name="productId"
                    value={form.productId}
                    onChange={handleFormChange}
                    className="w-full border rounded p-2"
                  >
                    <option value="">Select</option>
                    {MOCK_PRODUCTS.map((p) => (
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
                    name="operator"
                    value={form.operator}
                    onChange={handleFormChange}
                    className="w-full border rounded p-2"
                  >
                    <option value="">Select</option>
                    {MOCK_OPERATORS.map((op) => (
                      <option key={op.id} value={op.name}>{op.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date &amp; Time</label>
                  <Input name="date" type="datetime-local" value={form.date} onChange={handleFormChange} />
                </div>
                <DialogFooter className="mt-4">
                  <Button type="submit">Add Sale</Button>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                  </DialogClose>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
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
              {sales.length === 0 ? (
                <tr>
                  <td className="px-3 py-6 italic text-gray-400 text-center" colSpan={6}>
                    No sales records.
                  </td>
                </tr>
              ) : (
                sales.map((s) => (
                  <tr key={s.id} className="group">
                    <td className="px-3 py-2">{s.date}</td>
                    <td className="px-3 py-2">{s.productName}</td>
                    <td className="px-3 py-2 text-right">{s.quantity}</td>
                    <td className="px-3 py-2 text-right">₨{s.total}</td>
                    <td className="px-3 py-2">{s.operator}</td>
                    <td className="px-3 py-2 text-center">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-red-600 hover:bg-red-100"
                        onClick={() => handleDeleteSale(s.id)}
                        title="Delete sale"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
