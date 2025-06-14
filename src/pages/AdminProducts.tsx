
import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
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

type Product = {
  id: number;
  name: string;
  category: string;
  unit: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  status: "active" | "inactive";
};

const initialProducts: Product[] = [
  {
    id: 1,
    name: "Sharbati Wheat Atta",
    category: "Flour",
    unit: "Kg",
    price: 42,
    stock: 14,
    lowStockThreshold: 15,
    status: "active",
  },
  {
    id: 2,
    name: "Besan",
    category: "Flour",
    unit: "Kg",
    price: 80,
    stock: 40,
    lowStockThreshold: 10,
    status: "active",
  },
  {
    id: 3,
    name: "Turmeric Powder",
    category: "Spices",
    unit: "Kg",
    price: 310,
    stock: 5,
    lowStockThreshold: 8,
    status: "inactive",
  },
];

const unitOptions = ["Kg", "Gm", "Quintal", "Litre", "Unit"];

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  // Form state for Add/Edit
  const [form, setForm] = useState<Omit<Product, "id">>({
    name: "",
    category: "",
    unit: "Kg",
    price: 0,
    stock: 0,
    lowStockThreshold: 1,
    status: "active",
  });

  // Handle input changes
  function handleFormChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "number"
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
      lowStockThreshold: 1,
      status: "active",
    });
    setDialogOpen(true);
  }

  // Open edit product dialog
  function handleEdit(product: Product) {
    setEditProduct(product);
    setForm({ ...product });
    setDialogOpen(true);
  }

  // Submit add/edit form
  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.name.trim() === "" || form.category.trim() === "") {
      alert("Name and Category are required.");
      return;
    }
    if (form.price <= 0 || form.stock < 0 || form.lowStockThreshold < 0) {
      alert("Invalid price, stock or threshold value.");
      return;
    }
    if (editProduct) {
      // Edit
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editProduct.id
            ? { ...p, ...form }
            : p
        )
      );
    } else {
      // Add
      setProducts((prev) => [
        ...prev,
        {
          ...form,
          id: prev.length ? Math.max(...prev.map((p) => p.id)) + 1 : 1,
        },
      ]);
    }
    setDialogOpen(false);
  }

  // Handle delete product
  function handleDelete(product: Product) {
    if (
      window.confirm(
        `Are you sure you want to delete the product "${product.name}"?`
      )
    ) {
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-emerald-50 pb-20">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-8">
          <div className="text-2xl font-black tracking-wide text-amber-700">
            Product Management
          </div>
          <Button onClick={handleAdd} className="gap-2" variant="outline">
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-gray-100">
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
              {products.map((p) => (
                <TableRow key={p.id} className={p.status === "inactive" ? "opacity-60" : ""}>
                  <TableCell>
                    <span className={`font-semibold ${p.stock < p.lowStockThreshold ? "text-red-600" : ""}`}>
                      {p.name}
                    </span>
                  </TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell>{p.unit}</TableCell>
                  <TableCell>₨{p.price}</TableCell>
                  <TableCell>{p.stock}</TableCell>
                  <TableCell>{p.lowStockThreshold}</TableCell>
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
              ))}
            </TableBody>
          </Table>
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
                <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                <Input
                  required
                  id="lowStockThreshold"
                  name="lowStockThreshold"
                  type="number"
                  value={form.lowStockThreshold}
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
