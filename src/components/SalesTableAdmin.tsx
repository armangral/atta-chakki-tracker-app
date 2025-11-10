import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import React from "react";
import { Sale } from "@/types/sale";

type SalesTableAdminProps = {
  sales: Sale[];
  salesLoading: boolean;
  salesError: unknown;
  onDelete: (id: string) => void;
  deletePending: boolean;
};

const SalesTableAdmin: React.FC<SalesTableAdminProps> = ({
  sales,
  salesLoading,
  salesError,
  onDelete,
  deletePending,
}) => {
  if (salesLoading) {
    return (
      <div className="py-10 text-center text-gray-400">Loading sales...</div>
    );
  }

  if (salesError) {
    return (
      <div className="py-10 text-center text-red-500">
        Could not fetch sales.
        <br />
        <span className="text-xs">{String(salesError)}</span>
      </div>
    );
  }

  if (!sales.length) {
    return (
      <div className="px-3 py-8 italic text-gray-400 text-center">
        No sales records.
      </div>
    );
  }

  return (
    <table className="w-full border rounded-md overflow-hidden bg-white">
      <thead className="bg-emerald-50">
        <tr>
          <th className="px-3 py-2 text-left font-semibold text-gray-700 text-sm">
            Date/Time
          </th>
          <th className="px-3 py-2 text-left font-semibold text-gray-700 text-sm">
            Product
          </th>
          <th className="px-3 py-2 text-right font-semibold text-gray-700 text-sm">
            Qty
          </th>
          <th className="px-3 py-2 text-right font-semibold text-gray-700 text-sm">
            Total
          </th>
          <th className="px-3 py-2 text-left font-semibold text-gray-700 text-sm">
            Operator
          </th>
          <th className="px-3 py-2 text-center font-semibold text-gray-600 text-sm">
            Action
          </th>
        </tr>
      </thead>
      <tbody>
        {sales.map((s) => (
          <tr key={s.id} className="group hover:bg-gray-50">
            <td className="px-3 py-2 border-t">
              {new Date(s.date).toLocaleString()}
            </td>
            <td className="px-3 py-2 border-t">{s.product_name}</td>
            <td className="px-3 py-2 text-right border-t">
              {parseFloat(s.quantity).toFixed(2)}
            </td>
            <td className="px-3 py-2 text-right border-t">
              ₨{parseFloat(s.total).toFixed(2)}
            </td>
            <td className="px-3 py-2 border-t">{s.operator_name}</td>
            <td className="px-3 py-2 text-center border-t">
              <Button
                size="icon"
                variant="ghost"
                className="text-red-600 hover:bg-red-100"
                onClick={() => onDelete(s.id)}
                title="Delete sale"
                disabled={deletePending}
              >
                <Trash2 size={18} />
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default SalesTableAdmin;
