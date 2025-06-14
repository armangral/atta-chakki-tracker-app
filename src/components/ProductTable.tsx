
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import ProductTableActions from "./ProductTableActions";

type Product = {
  id: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  stock: number;
  low_stock_threshold: number;
  status: "active" | "inactive";
};

export default function ProductTable({
  loading,
  error,
  products,
  onEdit,
  onDelete,
}: {
  loading: boolean;
  error: string | null;
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}) {
  return (
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
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-400">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              products.map((p) => (
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
                    <ProductTableActions
                      product={p}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
