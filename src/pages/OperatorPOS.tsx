import { useState } from "react";
import MainHeader from "@/components/Layout/MainHeader";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import OperatorProductGrid from "./OperatorProductGrid";
import OperatorSaleInput from "./OperatorSaleInput";
import OperatorSalesLog from "./OperatorSalesLog";
import { getBillHtml } from "./posBillTemplates";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import RequireOperator from "@/components/Auth/RequireOperator";
import { Product, Sale } from "./operatorPOS.types"; // new

export default function OperatorPOS() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<string>("");
  const [search, setSearch] = useState("");
  const [lastSale, setLastSale] = useState<Sale | null>(null);

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
    queryKey: ["pos-sales"], // This is for POS log purpose
    queryFn: async () => {
      // Fetch current user
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

  // Sale creation mutation
  const addSaleMutation = useMutation({
    mutationFn: async ({ selectedId, qtyVal }: { selectedId: string; qtyVal: number }) => {
      // Fetch context
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not signed in");
      const product = products.find((p) => p.id === selectedId);
      if (!product) throw new Error("Product not found");
      if (qtyVal > product.stock) throw new Error("Not enough stock");
      // Get operator's name (from profiles)
      const { data: profileData } = await supabase.from("profiles").select("username").eq("id", session.user.id).maybeSingle();
      // Insert sale
      const { error } = await supabase.from("sales").insert([
        {
          product_id: product.id,
          product_name: product.name,
          quantity: qtyVal,
          total: qtyVal * product.price,
          date: new Date().toISOString(),
          operator_id: session.user.id,
          operator_name: profileData?.username ?? "",
        },
      ]);
      if (error) throw error;
      // Reduce product stock
      const { error: stockError } = await supabase
        .from("products")
        .update({ stock: product.stock - qtyVal })
        .eq("id", product.id);
      if (stockError) throw stockError;
      return {
        ...product,
        quantity: qtyVal,
        total: qtyVal * product.price,
        date: new Date().toISOString(),
        operator_id: session.user.id,
        operator_name: profileData?.username ?? "",
      };
    },
    onSuccess: (_, { selectedId, qtyVal }) => {
      // Refresh products & sales
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["pos-sales"] });
      // Set lastSale for Print Bill UI
      const product = products.find((p) => p.id === selectedId);
      if (product) {
        setLastSale({
          id: "",
          product_id: product.id,
          product_name: product.name,
          quantity: qtyVal,
          total: qtyVal * product.price,
          date: new Date().toLocaleString(),
          operator_id: "", // not used in bill print UI
          operator_name: "",
        });
      }
      setSelected(null);
      setQuantity("");
      toast({
        title: "Sale recorded!",
        description: `${product?.name}: ${qtyVal}${product?.unit} sold.`,
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

  // Confirm sale
  const handleConfirm = () => {
    const product = products.find((p) => p.id === selected);
    if (!product) return;
    const qtyNum = parseFloat(quantity);
    if (!qtyNum || qtyNum <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a valid quantity.",
      });
      return;
    }
    if (qtyNum > product.stock) {
      toast({
        title: "Insufficient Stock",
        description: "Not enough stock for this sale.",
      });
      return;
    }
    addSaleMutation.mutate({ selectedId: product.id, qtyVal: qtyNum });
  };

  // Print bill for any sale
  const handlePrintBill = (sale: Sale) => {
    // Re-hydrate product info for bill if needed
    const product = products.find((p) => p.id === sale.product_id);
    const saleForBill = {
      ...sale,
      productName: sale.product_name,
      quantity: sale.quantity,
      price: product?.price ?? 0,
      category: product?.category ?? "",
    };
    const billContents = getBillHtml(saleForBill, products);
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
            loading={productsLoading}
          />

          {/* Selected and quantity */}
          {selected && (
            <OperatorSaleInput
              product={products.find((p) => p.id === selected)!}
              quantity={quantity}
              setQuantity={setQuantity}
              onConfirm={handleConfirm}
              isSubmitting={addSaleMutation.isPending}
            />
          )}

          {/* POS Bill + Print Button for last sale */}
          {lastSale && (
            <div className="animate-fade-in mb-8 flex flex-col md:flex-row md:items-center gap-4">
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
          <OperatorSalesLog sales={sales} onPrintBill={handlePrintBill} loading={salesLoading} />
        </div>
      </div>
    </RequireOperator>
  );
}
