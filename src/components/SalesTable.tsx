
type Sale = {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  total: number;
  operator: string;
  date: string;
};

export default function SalesTable({ sales }: { sales: Sale[] }) {
  return (
    <div>
      <div className="mb-3 text-lg font-bold">Recent Sales</div>
      <table className="w-full border rounded-md overflow-hidden bg-white">
        <thead className="bg-emerald-50">
          <tr>
            <th className="px-3 py-2 text-left font-semibold text-gray-700 text-sm">Date</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-700 text-sm">Product</th>
            <th className="px-3 py-2 text-right font-semibold text-gray-700 text-sm">Qty</th>
            <th className="px-3 py-2 text-right font-semibold text-gray-700 text-sm">Total</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-700 text-sm">Operator</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((s) => (
            <tr key={s.id}>
              <td className="px-3 py-2">{s.date}</td>
              <td className="px-3 py-2">{s.productName}</td>
              <td className="px-3 py-2 text-right">{s.quantity}</td>
              <td className="px-3 py-2 text-right">₹{s.total}</td>
              <td className="px-3 py-2">{s.operator}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
