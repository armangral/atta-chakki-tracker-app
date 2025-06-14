
type Product = {
  id: number;
  name: string;
  unit: string;
  stock: number;
  lowStockThreshold: number;
};

export default function LowStockAlert({ products }: { products: Product[] }) {
  if (products.length === 0)
    return (
      <div className="flex flex-col items-center text-emerald-600 gap-1">
        <span className="text-lg font-extrabold">Inventory Healthy</span>
        <span className="text-sm">No low stock alerts 🎉</span>
      </div>
    );
  return (
    <div className="flex flex-col gap-1 text-red-700">
      <span className="text-lg font-extrabold">Low Stock Alert!</span>
      <ul className="mt-1 space-y-0.5 pl-3">
        {products.map((p) => (
          <li key={p.id} className="text-sm">
            {p.name}: <span className="font-bold">{p.stock} {p.unit}</span>
            <span className="ml-2 text-xs text-red-500">(Threshold: {p.lowStockThreshold})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
