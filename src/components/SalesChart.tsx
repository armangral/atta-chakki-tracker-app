
import { useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

type Sale = {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  total: number;
  operator: string;
  date: string; // format: "YYYY-MM-DD HH:mm"
};

type SalesChartProps = {
  sales: Sale[];
};

function getPeriodKey(date: Date, mode: string) {
  if (mode === "year") {
    return date.getFullYear();
  }
  if (mode === "month") {
    // Use yyyy-mm for months
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }
  if (mode === "week") {
    // Get ISO week number
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date as any) - (firstDayOfYear as any);
    const days = Math.floor(pastDaysOfYear / (24 * 60 * 60 * 1000));
    const week = Math.ceil((days + firstDayOfYear.getDay() + 1) / 7);
    return `${date.getFullYear()}-W${week}`;
  }
}

function getBarLabel(periodKey: string, mode: string) {
  if (mode === "year") return periodKey;
  if (mode === "month") {
    const [year, m] = periodKey.split("-");
    return `${m}/${year}`;
  }
  if (mode === "week") {
    const [year, w] = periodKey.split("-W");
    return `W${w}-${year}`;
  }
  return periodKey;
}

export default function SalesChart({ sales }: SalesChartProps) {
  const [mode, setMode] = useState<"month" | "week" | "year">("month");

  // Parse string date to actual Date object
  const groupedData = useMemo(() => {
    const group: Record<string, { label: string; total: number; quantity: number }> = {};
    for (const sale of sales) {
      const d = new Date(sale.date.replace(" ", "T")); // local time
      const key = getPeriodKey(d, mode);
      if (!group[key]) {
        group[key] = { label: getBarLabel(key as string, mode), total: 0, quantity: 0 };
      }
      group[key].total += sale.total;
      group[key].quantity += sale.quantity;
    }
    // Sort by key (force both keys to string for localeCompare)
    return Object.entries(group)
      .sort(([k1], [k2]) => String(k1).localeCompare(String(k2)))
      .map(([, val]) => val);
  }, [sales, mode]);

  return (
    <div className="w-full bg-white rounded-xl shadow-md border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-medium">Sales Overview</div>
        <Select value={mode} onValueChange={v => setMode(v as any)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Monthly</SelectItem>
            <SelectItem value="week">Weekly</SelectItem>
            <SelectItem value="year">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div style={{ minHeight: 260, width: "100%" }}>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={groupedData}
            margin={{ top: 10, right: 40, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" fontSize={12} />
            <YAxis yAxisId="left" orientation="left" fontSize={12} width={60} tickFormatter={v => `₨${v}`} />
            <YAxis yAxisId="right" orientation="right" fontSize={12} width={60} tickFormatter={v => `${v}Kg`} />
            <Tooltip formatter={(value: any, name: string) => name === "Sales" ? `₨${value}` : `${value} Kg`} />
            <Legend payload={[
              { id: "Sales", type: "rect", value: "Sales (₨)", color: "#059669" },
              { id: "Quantity", type: "rect", value: "Quantity (Kg)", color: "#f59e42" }
            ]}/>
            <Bar yAxisId="left" dataKey="total" name="Sales" fill="#059669" radius={4} />
            <Bar yAxisId="right" dataKey="quantity" name="Quantity" fill="#f59e42" radius={4} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
