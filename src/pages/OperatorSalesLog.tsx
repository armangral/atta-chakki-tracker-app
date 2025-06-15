
import React from "react";
import { Printer } from "lucide-react";
import { Sale } from "./operatorPOS.types";

type Props = {
  sales: Sale[];
  onPrintBill: (sales: Sale[] | Sale) => void;
  loading?: boolean;
};

// Helper to group sales by bill_id (null = old single sale)
function groupSalesByBill(sales: Sale[]) {
  const byBill: { [billId: string]: Sale[] } = {};
  for (const sale of sales) {
    const groupKey = sale.bill_id || sale.id; // If bill_id missing, fallback to unique row
    if (!byBill[groupKey]) byBill[groupKey] = [];
    byBill[groupKey].push(sale);
  }
  // Sort by most recent (using the first sale's date)
  return Object.values(byBill).sort((a, b) =>
    new Date(b[0].date).getTime() - new Date(a[0].date).getTime()
  );
}

export default function OperatorSalesLog({ sales, onPrintBill, loading }: Props) {
  if (loading) {
    return (
      <div className="mt-12 animate-fade-in text-center text-gray-500">Loading sales...</div>
    );
  }
  if (sales.length === 0) return null;

  // Group sales by bill
  const groupedBills = groupSalesByBill(sales);

  return (
    <div className="mt-12 animate-fade-in">
      <div className="text-lg font-semibold mb-2">Today's Sales (This device)</div>
      <div className="w-full overflow-x-auto">
        <table className="w-full border rounded-md overflow-hidden bg-white text-sm">
          <thead className="bg-emerald-50">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-gray-700 text-xs">Time</th>
              <th className="px-3 py-2 text-left font-semibold text-gray-700 text-xs">Products</th>
              <th className="px-3 py-2 text-right font-semibold text-gray-700 text-xs">Qty</th>
              <th className="px-3 py-2 text-right font-semibold text-gray-700 text-xs">Total</th>
              <th className="px-3 py-2 text-center font-semibold text-gray-700 text-xs">Bill</th>
            </tr>
          </thead>
          <tbody>
            {groupedBills.map((salesOfBill, idx) => {
              // each salesOfBill is an array (usually length > 1 for cart)
              const total = salesOfBill.reduce((sum, s) => sum + Number(s.total), 0);
              const totalQty = salesOfBill.reduce((sum, s) => sum + Number(s.quantity), 0);
              const productNames = salesOfBill.map(s => `${s.product_name} (${s.quantity})`).join(", ");
              return (
                <tr key={salesOfBill[0].bill_id || salesOfBill[0].id} className="align-top">
                  <td className="px-3 py-2">{new Date(salesOfBill[0].date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-3 py-2">
                    {salesOfBill.map((s, i) => (
                      <div key={i}>{s.product_name} <span className="text-xs text-amber-700">({s.quantity})</span></div>
                    ))}
                  </td>
                  <td className="px-3 py-2 text-right">{totalQty}</td>
                  <td className="px-3 py-2 text-right">₨{total}</td>
                  <td className="px-3 py-2 text-center">
                    <button
                      title="Print Bill"
                      onClick={() => onPrintBill(salesOfBill.length > 1 ? salesOfBill : salesOfBill[0])}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-bold bg-amber-100 text-amber-700 hover:bg-amber-200 transition"
                    >
                      <Printer size={16} /> Print
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="text-emerald-600 mt-2">
        <span className="font-bold">
          Total: ₨{sales.reduce((a, s) => a + Number(s.total), 0)}
        </span>
      </div>
    </div>
  );
}
