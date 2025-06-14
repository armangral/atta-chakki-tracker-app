
import React from "react";
import { Printer } from "lucide-react";
import { Sale } from "./OperatorPOS";

type Props = {
  sales: Sale[];
  onPrintBill: (sale: Sale) => void;
};

export default function OperatorSalesLog({ sales, onPrintBill }: Props) {
  if (sales.length === 0) return null;

  return (
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
              <th className="px-3 py-2 text-center font-semibold text-gray-700 text-xs">Bill</th>
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
                <td className="px-3 py-2 text-center">
                  <button
                    title="Print Bill"
                    onClick={() => onPrintBill(sale)}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-bold bg-amber-100 text-amber-700 hover:bg-amber-200 transition"
                  >
                    <Printer size={16} /> Print
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-emerald-600 mt-2">
        <span className="font-bold">
          Total: ₨{sales.reduce((a, s) => a + s.total, 0)}
        </span>
      </div>
    </div>
  );
}
