
import { useState } from "react";
import MainHeader from "@/components/Layout/MainHeader";
import { toast } from "@/hooks/use-toast";

const MOCK_PRODUCTS = [
  { id: 1, name: "Sharbati Wheat Atta", price: 42, stock: 95, unit: "Kg" },
  { id: 2, name: "Besan", price: 80, stock: 40, unit: "Kg" },
  { id: 3, name: "Turmeric Powder", price: 310, stock: 15, unit: "Kg" },
];

export default function OperatorPOS() {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [selected, setSelected] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<string>("");
  const [sales, setSales] = useState<{ productId: number; productName: string; quantity: number; total: number; date: string }[]>([]);

  const handleProductClick = (id: number) => {
    setSelected(id);
    setQuantity("");
  };

  const handleConfirm = () => {
    const prod = products.find((p) => p.id === selected);
    if (!prod) return;
    const qtyNum = parseFloat(quantity);
    if (!qtyNum || qtyNum <= 0) {
      toast({ title: "Invalid Quantity", description: "Please enter a valid quantity.", });
      return;
    }
    if (qtyNum > prod.stock) {
      toast({ title: "Insufficient Stock", description: "Not enough stock for this sale." });
      return;
    }
    // Deduct stock
    setProducts((prev) =>
      prev.map((p) =>
        p.id === prod.id ? { ...p, stock: p.stock - qtyNum } : p
      )
    );
    setSales([
      { productId: prod.id, productName: prod.name, quantity: qtyNum, total: qtyNum * prod.price, date: new Date().toLocaleString() },
      ...sales,
    ]);
    setSelected(null);
    setQuantity("");
    toast({ title: "Sale recorded!", description: `${prod.name}: ${qtyNum}${prod.unit} sold.` });
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-emerald-50 via-white to-amber-50 pb-20">
      <MainHeader userRole="operator" />
      <div className="max-w-4xl mx-auto px-4 pt-10">
        <div className="mb-5 text-2xl font-bold text-gray-800">Quick Sale</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {products.map((prod) => (
            <button
              key={prod.id}
              className={`rounded-xl shadow border border-gray-100 bg-white hover:bg-emerald-50 flex flex-col items-center py-7 px-3 font-semibold text-lg relative ${selected === prod.id ? "ring-2 ring-emerald-500" : ""}`}
              onClick={() => handleProductClick(prod.id)}
            >
              {prod.name}
              <span className="block text-sm text-gray-500 font-normal">{`₹${prod.price}/${prod.unit}`}</span>
              <span className="absolute top-2 right-4 text-xs bg-amber-100 text-amber-700 rounded-full px-2">{prod.stock} {prod.unit}</span>
            </button>
          ))}
        </div>
        {selected && (
          <div className="my-6 flex flex-col md:flex-row md:items-center gap-4 border rounded-lg p-6 bg-white shadow">
            <div className="font-semibold text-lg flex-1">Enter Quantity:</div>
            <input
              className="border-gray-300 rounded px-4 py-2 w-24 text-lg font-semibold focus:ring-amber-500"
              type="number"
              autoFocus
              step={0.1}
              min={0}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Qty"
            />
            <button
              onClick={handleConfirm}
              className="ml-4 px-6 py-2 rounded-lg bg-emerald-600 text-white font-bold text-lg hover:bg-emerald-700 transition"
            >Confirm Sale</button>
          </div>
        )}
        {sales.length > 0 && (
          <div className="mt-12">
            <div className="text-lg font-semibold mb-2">Today's Sales (This device)</div>
            <table className="w-full border rounded-md overflow-hidden bg-white">
              <thead className="bg-emerald-50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 text-sm">Time</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 text-sm">Product</th>
                  <th className="px-3 py-2 text-right font-semibold text-gray-700 text-sm">Qty</th>
                  <th className="px-3 py-2 text-right font-semibold text-gray-700 text-sm">Total</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.date + sale.productId}>
                    <td className="px-3 py-2">{sale.date}</td>
                    <td className="px-3 py-2">{sale.productName}</td>
                    <td className="px-3 py-2 text-right">{sale.quantity}</td>
                    <td className="px-3 py-2 text-right">₹{sale.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-emerald-600 mt-2">
              <span className="font-bold">Total: ₹{sales.reduce((a, s) => a + s.total, 0)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
