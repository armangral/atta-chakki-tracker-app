
type Product = {
  id: number;
  name: string;
  category: string;
  unit: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
};

export default function ProductTable({ products }: { products: Product[] }) {
  return (
    <div>
      <div className="mb-3 text-lg font-bold">Products &amp; Inventory</div>
      <table className="w-full border rounded-md overflow-hidden bg-white">
        <thead className="bg-amber-50">
          <tr>
            <th className="px-3 py-2 text-left font-semibold text-gray-700 text-sm">Name</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-700 text-sm">Category</th>
            <th className="px-3 py-2 text-right font-semibold text-gray-700 text-sm">Unit</th>
            <th className="px-3 py-2 text-right font-semibold text-gray-700 text-sm">Price</th>
            <th className="px-3 py-2 text-right font-semibold text-gray-700 text-sm">In Stock</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className={p.stock < p.lowStockThreshold ? "bg-red-50" : ""}>
              <td className="px-3 py-2 font-semibold">{p.name}</td>
              <td className="px-3 py-2">{p.category}</td>
              <td className="px-3 py-2 text-right">{p.unit}</td>
              <td className="px-3 py-2 text-right">₹{p.price}</td>
              <td className="px-3 py-2 text-right">{p.stock} {p.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
