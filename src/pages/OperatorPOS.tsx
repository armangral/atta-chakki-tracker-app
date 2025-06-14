
import { useState, useMemo } from "react";
import MainHeader from "@/components/Layout/MainHeader";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

// Add categories to products
const MOCK_PRODUCTS = [
  { id: 1, name: "Sharbati Wheat Atta", price: 42, stock: 95, unit: "Kg", category: "Flour" },
  { id: 2, name: "Besan", price: 80, stock: 40, unit: "Kg", category: "Flour" },
  { id: 3, name: "Turmeric Powder", price: 310, stock: 15, unit: "Kg", category: "Spices" },
  // Add more products with relevant categories as needed
];

export default function OperatorPOS() {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [selected, setSelected] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<string>("");
  const [sales, setSales] = useState<
    { productId: number; productName: string; quantity: number; total: number; date: string; category: string }[]
  >([]);
  const [search, setSearch] = useState("");

  const handleProductClick = (id: number) => {
    setSelected(id);
    setQuantity("");
  };

  const handleConfirm = () => {
    const prod = products.find((p) => p.id === selected);
    if (!prod) return;
    const qtyNum = parseFloat(quantity);
    if (!qtyNum || qtyNum <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a valid quantity.",
      });
      return;
    }
    if (qtyNum > prod.stock) {
      toast({
        title: "Insufficient Stock",
        description: "Not enough stock for this sale.",
      });
      return;
    }
    setProducts((prev) =>
      prev.map((p) =>
        p.id === prod.id ? { ...p, stock: p.stock - qtyNum } : p
      )
    );
    setSales([
      {
        productId: prod.id,
        productName: prod.name,
        quantity: qtyNum,
        total: qtyNum * prod.price,
        date: new Date().toLocaleString(),
        category: prod.category,
      },
      ...sales,
    ]);
    setSelected(null);
    setQuantity("");
    toast({
      title: "Sale recorded!",
      description: `${prod.name}: ${qtyNum}${prod.unit} sold.`,
    });
  };

  // Memoized product filtering for the search bar
  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    return products.filter((prod) =>
      prod.name.toLowerCase().includes(search.trim().toLowerCase())
    );
  }, [search, products]);

  // Calculate per-category sales stats from the start
  const categoryAggregates = useMemo(() => {
    // First, collect product categories from the MOCK_PRODUCTS to show all even if 0 sales
    const categories = Array.from(new Set(products.map((p) => p.category)));
    const result: { [category: string]: { totalAmount: number; totalQty: number } } = {};
    for (const cat of categories) {
      result[cat] = { totalAmount: 0, totalQty: 0 };
    }
    for (const sale of sales) {
      if (!result[sale.category]) {
        result[sale.category] = { totalAmount: 0, totalQty: 0 };
      }
      result[sale.category].totalAmount += sale.total;
      result[sale.category].totalQty += sale.quantity;
    }
    return result;
  }, [sales, products]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-emerald-50 via-white to-amber-50 pb-20 flex flex-col">
      <MainHeader userRole="operator" />
      <div className="w-full max-w-4xl mx-auto px-4 pt-8 flex-1 flex flex-col">
        {/* Header and search */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-emerald-900 mb-2">Quick Sale</h1>
            <div className="text-base text-muted-foreground">
              Select a product and confirm sale.
            </div>
          </div>
          {/* Product search bar */}
          <div className="w-full md:w-96">
            <div className="relative">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products…"
                className="pl-10 pr-3 bg-white shadow border focus:ring-emerald-400 focus:border-emerald-500"
                autoComplete="off"
              />
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
            </div>
          </div>
        </div>

        {/* Category sales summary */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-fade-in">
          {Object.entries(categoryAggregates).map(([cat, agg]) => (
            <div
              key={cat}
              className="flex flex-col items-start p-4 rounded-lg shadow border bg-white"
            >
              <span className="text-sm font-medium text-gray-500">{cat}</span>
              <span className="text-lg font-bold text-emerald-700">
                ₨{agg.totalAmount.toLocaleString()} &middot; {agg.totalQty} units
              </span>
            </div>
          ))}
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8 animate-fade-in">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center text-lg text-gray-400 py-10">
              No matching products found.
            </div>
          ) : (
            filteredProducts.map((prod) => (
              <button
                key={prod.id}
                className={
                  `rounded-xl shadow hover-scale border border-gray-100 bg-white hover:bg-emerald-50 flex flex-col items-center justify-center py-7 px-3 font-semibold text-lg relative group transition-all duration-150 
                  ${selected === prod.id ? "ring-2 ring-emerald-500 bg-emerald-50" : ""}`
                }
                onClick={() => handleProductClick(prod.id)}
                tabIndex={0}
              >
                <span className="group-hover:text-emerald-700">{prod.name}</span>
                <span className="block mt-1 text-sm text-gray-500 font-normal">{`₨${prod.price}/${prod.unit}`}</span>
                <span className="absolute top-2 right-4 text-xs bg-amber-100 text-amber-700 rounded-full px-2 font-semibold shadow">
                  {prod.stock} {prod.unit}
                </span>
                <span className="absolute bottom-2 right-4 text-xs bg-emerald-100 text-emerald-700 rounded-full px-2 font-medium">
                  {prod.category}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Selected and quantity */}
        {selected && (
          <div className="my-6 flex flex-col md:flex-row md:items-center gap-4 border rounded-lg p-6 bg-white shadow animate-fade-in">
            <div className="font-semibold text-lg flex-1">
              {products.find((p) => p.id === selected)?.name}
            </div>
            <Input
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
              className="ml-0 md:ml-4 px-6 py-2 rounded-lg bg-emerald-600 text-white font-bold text-lg hover:bg-emerald-700 transition-shadow"
            >
              Confirm Sale
            </button>
          </div>
        )}

        {/* Sales log table */}
        {sales.length > 0 && (
          <div className="mt-12 animate-fade-in">
            <div className="text-lg font-semibold mb-2">Today's Sales (This device)</div>
            <div className="w-full overflow-x-auto">
              <table className="w-full border rounded-md overflow-hidden bg-white text-sm">
                <thead className="bg-emerald-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 text-xs">Time</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 text-xs">Product</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 text-xs">Category</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-700 text-xs">Qty</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-700 text-xs">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale.date + sale.productId}>
                      <td className="px-3 py-2">{sale.date}</td>
                      <td className="px-3 py-2">{sale.productName}</td>
                      <td className="px-3 py-2">{sale.category}</td>
                      <td className="px-3 py-2 text-right">{sale.quantity}</td>
                      <td className="px-3 py-2 text-right">₨{sale.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-emerald-600 mt-2">
              <span className="font-bold">Total: ₨{sales.reduce((a, s) => a + s.total, 0)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
