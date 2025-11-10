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
import { useActiveProducts } from "@/hooks/useProducts";
import { useSales, useCheckout } from "@/hooks/useSales";
import {
  ProductResponse,
  SaleResponse,
  CheckoutItemDto,
} from "@/services/attachakkiservice";
import { useAuth } from "@/hooks/useAuth";

export type CartItem = {
  product: ProductResponse;
  quantity: number;
};

export default function OperatorPOS() {
  const [selected, setSelected] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<string>("");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [lastBillId, setLastBillId] = useState<string | null>(null);
  console.log("redirected");

  // Fetch current user
  const { user: currentUser } = useAuth();

  // Fetch active products
  const { data: productsData, isLoading: productsLoading } =
    useActiveProducts();

  const products = productsData || [];

  // Fetch sales for current operator
  const { data: salesData, isLoading: salesLoading } = useSales({
    operator_id: currentUser?.id,
    page_size: 100,
    sort_by: "date",
    sort_order: "desc",
  });
  const sales = salesData?.sales || [];

  // Filter sales to only today's sales
  const todayISO = new Date().toISOString().slice(0, 10);
  const todaySales = sales.filter(
    (sale) => sale.date && sale.date.slice(0, 10) === todayISO
  );

  // Checkout mutation
  const checkoutMutation = useCheckout();

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
      toast({
        title: "Invalid Selection",
        description: "Please select a valid product and quantity.",
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

    // If already in cart, update quantity, else add new
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.product.id === product.id);
      if (idx !== -1) {
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

    // Prepare checkout data
    const items: CheckoutItemDto[] = cart.map((item) => ({
      product_id: item.product.id,
      quantity: item.quantity,
      total: item.quantity * parseFloat(item.product.price),
    }));

    const checkoutData = {
      items,
      date: new Date().toISOString(),
    };

    checkoutMutation.mutate(checkoutData, {
      onSuccess: (response) => {
        setLastBillId(response.bill_id);
        setCart([]);
        setSelected(null);
        setQuantity("");
        toast({
          title: "Sale recorded!",
          description: "Sale completed and bill ready for print.",
        });
      },
    });
  };

  // Print bill for sales
  const handlePrintBill = (salesToPrint: SaleResponse[] | SaleResponse) => {
    let itemsToPrint: SaleResponse[];
    if (Array.isArray(salesToPrint)) {
      itemsToPrint = salesToPrint;
    } else {
      itemsToPrint = [salesToPrint];
    }

    // Convert ProductResponse to Product type for getBillHtml
    const productsForBill = products.map((p) => ({
      id: p.id,
      name: p.name,
      price: parseFloat(p.price),
      stock: p.stock,
      unit: p.unit,
      category: p.category,
    }));

    const billContents = getBillHtml(itemsToPrint as any, productsForBill);
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

  // Get last bill sales for printing
  const lastBillSales = lastBillId
    ? sales.filter((s) => s.bill_id === lastBillId)
    : null;

  // Filtered products logic
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
            <h1 className="text-2xl font-bold text-emerald-900 mb-2">
              Quick Sale
            </h1>
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
          products={filteredProducts.map((p) => ({
            id: p.id,
            name: p.name,
            price: parseFloat(p.price),
            stock: p.stock,
            unit: p.unit,
            category: p.category,
          }))}
          selected={selected}
          onProductClick={handleProductClick}
          loading={productsLoading}
        />

        {/* Selected product and quantity input */}
        {selected && (
          <OperatorSaleInput
            product={{
              id: products.find((p) => p.id === selected)!.id,
              name: products.find((p) => p.id === selected)!.name,
              price: parseFloat(products.find((p) => p.id === selected)!.price),
              stock: products.find((p) => p.id === selected)!.stock,
              unit: products.find((p) => p.id === selected)!.unit,
              category: products.find((p) => p.id === selected)!.category,
            }}
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
            cart={cart.map((item) => ({
              product: {
                id: item.product.id,
                name: item.product.name,
                price: parseFloat(item.product.price),
                stock: item.product.stock,
                unit: item.product.unit,
                category: item.product.category,
              },
              quantity: item.quantity,
            }))}
            onRemove={handleRemoveFromCart}
            onCheckout={handleCheckout}
            isSubmitting={checkoutMutation.isPending}
          />
        )}

        {/* Print Button for last sale */}
        {lastBillSales && lastBillSales.length > 0 && (
          <div className="animate-fade-in mb-8 flex flex-col md:flex-row md:items-center gap-4 mt-8">
            <button
              onClick={() => handlePrintBill(lastBillSales)}
              className="px-6 py-2 rounded-lg bg-amber-500 text-white font-bold text-lg hover:bg-amber-600 transition-shadow flex items-center gap-2"
            >
              Print Bill
            </button>
            <span className="text-xs text-muted-foreground">
              For physical receipt/printer.
            </span>
          </div>
        )}

        {/* Sales log table */}
        <OperatorSalesLog
          sales={todaySales as any}
          onPrintBill={handlePrintBill as any}
          loading={salesLoading}
        />
      </div>
    </div>
  );
}
