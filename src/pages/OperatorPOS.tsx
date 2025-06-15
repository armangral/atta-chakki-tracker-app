import { useState } from "react";
import MainHeader from "@/components/Layout/MainHeader";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import OperatorProductGrid from "./OperatorProductGrid";
import OperatorSaleInput from "./OperatorSaleInput";
import OperatorSalesLog from "./OperatorSalesLog";
import OperatorCart from "./OperatorCart";
import { getBillHtml } from "./posBillTemplates";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import RequireOperator from "@/components/Auth/RequireOperator";
import { Product, Sale } from "./operatorPOS.types";

// Helper to generate a random UUID (frontend only)
function randomUUID() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  // fallback - not cryptographically secure
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0, v = c == "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export type CartItem = {
  product: Product;
  quantity: number;
};

export default function OperatorPOS() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<string>("");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [lastSale, setLastSale] = useState<Sale[] | null>(null); // will hold array of sales

  // Fetch products from Supabase
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id,name,price,stock,unit,category")
        .order("name", { ascending: true });
      if (error) throw error;
      return data as Product[];
    },
  });

  // Fetch own sales (recent, current operator's)
  const { data: sales = [], isLoading: salesLoading } = useQuery({
    queryKey: ["pos-sales"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];
      const { data, error } = await supabase
        .from("sales")
        .select("*")
        .eq("operator_id", session.user.id)
        .order("date", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as Sale[];
    },
  });

  // Filter sales to only today's sales
  const todayISO = new Date().toISOString().slice(0, 10); // e.g., '2025-06-15'
  const todaySales = sales.filter(
    (sale) => sale.date && sale.date.slice(0, 10) === todayISO
  );

  // Sale creation mutation (handles multiple items at checkout)
  const checkoutMutation = useMutation({
    mutationFn: async (cartItems: CartItem[]) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not signed in");
      const { data: profileData } = await supabase.from("profiles").select("username").eq("id", session.user.id).maybeSingle();
      // Validate stock
      for (const item of cartItems) {
        const p = products.find((prod) => prod.id === item.product.id);
        if (!p) throw new Error(`Product not found: ${item.product.name}`);
        if (item.quantity > p.stock) throw new Error(`Not enough stock for ${p.name}`);
      }
      // Generate a bill UUID for this transaction
      const billId = randomUUID();

      // Insert all sales
      const salesPayload = cartItems.map((item) => ({
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        total: item.quantity * item.product.price,
        date: new Date().toISOString(),
        operator_id: session.user.id,
        operator_name: profileData?.username ?? "",
        bill_id: billId,
      }));
      const { error } = await supabase.from("sales").insert(salesPayload);
      if (error) throw error;
      // Reduce stock for each product
      for (const item of cartItems) {
        const p = products.find((prod) => prod.id === item.product.id);
        const { error: stockError } = await supabase
          .from("products")
          .update({ stock: p!.stock - item.quantity })
          .eq("id", item.product.id);
        if (stockError) throw stockError;
      }
      return salesPayload;
    },
    onSuccess: (salesCreated: Sale[]) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["pos-sales"] });
      setLastSale(salesCreated);
      setCart([]);
      setSelected(null);
      setQuantity("");
      toast({
        title: "Sale recorded!",
        description: "Sale completed and bill ready for print.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Sale failed",
        description: String(err?.message ?? err),
      });
    },
  });

  // Handle product selection
  const handleProductClick = (id: string) => {
    setSelected(id);
    setQuantity("");
  };

  // Add product + quantity to cart
  const handleAddToCart = () => {
    const product = products.find((p) => p.id === selected);
    const qtyNum = parseFloat(quantity);
    if (!product || !qtyNum || qtyNum <= 0) {
      toast({ title: "Invalid Selection", description: "Please select a valid product and quantity." });
      return;
    }
    if (qtyNum > product.stock) {
      toast({ title: "Insufficient Stock", description: "Not enough stock for this sale." });
      return;
    }
    // If already in cart, update quantity, else add new
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.product.id === product.id);
      if (idx !== -1) {
        // Replace old quantity
        const updatedCart = [...prev];
        updatedCart[idx] = { product, quantity: qtyNum };
        return updatedCart;
      }
      return [...prev, { product, quantity: qtyNum }];
    });
    setSelected(null);
    setQuantity("");
  };

  // Remove item from cart
  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Checkout/Confirm Sale for all items in cart
  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({ title: "No items", description: "Cart is empty." });
      return;
    }
    checkoutMutation.mutate(cart);
  };

  // Print bill for last sale (multi-product)
  const handlePrintBill = (sales: Sale[] | Sale) => {
    let itemsToPrint: Sale[];
    if (Array.isArray(sales)) {
      itemsToPrint = sales;
    } else {
      itemsToPrint = [sales];
    }
    // hydrate product info for all items
    const billContents = getBillHtml(itemsToPrint, products);
    if (!billContents) return;
    const printWindow = window.open("", "", "width=275,height=600");
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

  // Filtered products logic
  const filteredProducts = !search.trim()
    ? products
    : products.filter((prod) =>
        prod.name.toLowerCase().includes(search.trim().toLowerCase())
      );

  return (
    <RequireOperator>
      <div className="min-h-screen bg-gradient-to-r from-emerald-50 via-white to-amber-50 pb-20 flex flex-col">
        <MainHeader userRole="operator" />
        <div className="w-full max-w-4xl mx-auto px-4 pt-8 flex-1 flex flex-col">
          {/* Header and search */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-emerald-900 mb-2">Quick Sale</h1>
              <div className="text-base text-muted-foreground">
                Select products, set quantity, and check out.
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
            loading={productsLoading}
          />

          {/* Selected product and quantity input */}
          {selected && (
            <OperatorSaleInput
              product={products.find((p) => p.id === selected)!}
              quantity={quantity}
              setQuantity={setQuantity}
              onConfirm={handleAddToCart}
              isSubmitting={checkoutMutation.isPending}
              actionLabel="Add To Cart"
            />
          )}

          {/* Cart */}
          {cart.length > 0 && (
            <OperatorCart
              cart={cart}
              onRemove={handleRemoveFromCart}
              onCheckout={handleCheckout}
              isSubmitting={checkoutMutation.isPending}
            />
          )}

          {/* POS Bill + Print Button for last sale (multi-line) */}
          {lastSale && lastSale.length > 0 && (
            <div className="animate-fade-in mb-8 flex flex-col md:flex-row md:items-center gap-4 mt-8">
              <button
                onClick={() => handlePrintBill(lastSale)}
                className="px-6 py-2 rounded-lg bg-amber-500 text-white font-bold text-lg hover:bg-amber-600 transition-shadow flex items-center gap-2"
              >
                Print Bill
              </button>
              <span className="text-xs text-muted-foreground">For physical receipt/printer.</span>
            </div>
          )}

          {/* Sales log table */}
          <OperatorSalesLog sales={todaySales} onPrintBill={handlePrintBill} loading={salesLoading} />
        </div>
      </div>
    </RequireOperator>
  );
}
