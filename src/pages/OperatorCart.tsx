
import React from "react";
import { CartItem } from "./OperatorPOS";
import { Minus } from "lucide-react";

type Props = {
  cart: CartItem[];
  onRemove: (id: string) => void;
  onCheckout: () => void;
  isSubmitting?: boolean;
};

export default function OperatorCart({ cart, onRemove, onCheckout, isSubmitting }: Props) {
  const total = cart.reduce((sum, item) => sum + (item.quantity * item.product.price), 0);

  return (
    <div className="animate-fade-in mb-10 mt-6 border rounded-lg shadow bg-white p-5">
      <div className="text-lg font-bold mb-3">Cart</div>
      <table className="w-full mb-2 text-sm">
        <thead>
          <tr className="bg-emerald-50">
            <th className="px-2 py-1 text-left">Product</th>
            <th className="px-2 py-1 text-right">Qty</th>
            <th className="px-2 py-1 text-right">Rate</th>
            <th className="px-2 py-1 text-right">Amount</th>
            <th className="px-2 py-1 text-center">Remove</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item) => (
            <tr key={item.product.id}>
              <td className="px-2 py-1">{item.product.name}</td>
              <td className="px-2 py-1 text-right">{item.quantity} {item.product.unit}</td>
              <td className="px-2 py-1 text-right">₨{item.product.price}</td>
              <td className="px-2 py-1 text-right">₨{(item.product.price * item.quantity).toFixed(0)}</td>
              <td className="px-2 py-1 text-center">
                <button
                  title="Remove from cart"
                  onClick={() => onRemove(item.product.id)}
                  className="inline-flex items-center gap-1 p-2 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 transition"
                  disabled={!!isSubmitting}
                >
                  <Minus size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between mt-2 mb-2">
        <span className="font-medium text-emerald-700">Total:</span>
        <span className="font-bold text-lg text-emerald-900">₨{total.toLocaleString()}</span>
      </div>
      <button
        className="mt-4 px-6 py-2 rounded-lg bg-emerald-700 text-white font-bold text-lg hover:bg-emerald-800 transition"
        onClick={onCheckout}
        disabled={!!isSubmitting}
      >
        {isSubmitting ? "Processing..." : "Checkout & Print Bill"}
      </button>
    </div>
  );
}
