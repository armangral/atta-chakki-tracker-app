import { useState } from "react";
import MainHeader from "@/components/Layout/MainHeader";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import OperatorProductGrid from "./OperatorProductGrid";
import OperatorSaleInput from "./OperatorSaleInput";
import OperatorSalesLog from "./OperatorSalesLog";
import { getBillHtml } from "./posBillTemplates";

const MOCK_PRODUCTS = [
  { id: 1, name: "Sharbati Wheat Atta", price: 42, stock: 95, unit: "Kg", category: "Flour" },
  { id: 2, name: "Besan", price: 80, stock: 40, unit: "Kg", category: "Flour" },
  { id: 3, name: "Turmeric Powder", price: 310, stock: 15, unit: "Kg", category: "Spices" },
  // ... more products
];

export type Product = typeof MOCK_PRODUCTS[number];
export type Sale = {
  productId: number;
  productName: string;
  quantity: number;
  total: number;
  date: string;
  category: string;
  price: number;
};

export default function OperatorPOS() {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [selected, setSelected] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<string>("");
  const [sales, setSales] = useState<Sale[]>([]);
  const [search, setSearch] = useState("");
  const [lastSale, setLastSale] = useState<Sale | null>(null);

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
    const sale = {
      productId: prod.id,
      productName: prod.name,
      quantity: qtyNum,
      total: qtyNum * prod.price,
      date: new Date().toLocaleString(),
      category: prod.category,
      price: prod.price,
    };
    setSales([sale, ...sales]);
    setLastSale(sale);
    setSelected(null);
    setQuantity("");
    toast({
      title: "Sale recorded!",
      description: `${prod.name}: ${qtyNum}${prod.unit} sold.`,
    });
  };

  // Print bill for any sale
  const handlePrintBill = (sale: Sale) => {
    const billContents = getBillHtml(sale, products);
    if (!billContents) return;
    const printWindow = window.open("", "", "width=275,height=500");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>BILL - Punjab Atta Chakki</title>
            <style>
              body { margin:0; font-family: 'Courier New', Courier, monospace; width: 212px;}
            </style>
          </head>
          <body>
            ${billContents}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 150);
    }
  };

  // Filtered products logic (used in product grid)
  const filteredProducts = !search.trim()
    ? products
    : products.filter((prod) =>
        prod.name.toLowerCase().includes(search.trim().toLowerCase())
      );

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

        {/* Product grid */}
        <OperatorProductGrid
          products={filteredProducts}
          selected={selected}
          onProductClick={handleProductClick}
        />

        {/* Selected and quantity */}
        {selected && (
          <OperatorSaleInput
            product={products.find((p) => p.id === selected)!}
            quantity={quantity}
            setQuantity={setQuantity}
            onConfirm={handleConfirm}
          />
        )}

        {/* POS Bill + Print Button for last sale */}
        {lastSale && (
          <div className="animate-fade-in mb-8 flex flex-col md:flex-row md:items-center gap-4">
            <button
              onClick={() => handlePrintBill(lastSale)}
              className="px-6 py-2 rounded-lg bg-amber-500 text-white font-bold text-lg hover:bg-amber-600 transition-shadow flex items-center gap-2"
            >
              {/* Use <Printer size={20} /> here if needed */}
              Print Bill
            </button>
            <span className="text-xs text-muted-foreground">For physical receipt/printer.</span>
          </div>
        )}

        {/* Sales log table */}
        <OperatorSalesLog sales={sales} onPrintBill={handlePrintBill} />
      </div>
    </div>
  );
}
