// src/components/SalesChart.tsx
import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar"; // <-- any shadcn/ui calendar
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useChartSalesData, ChartSale } from "@/hooks/useChartSalesData";

type Mode = "day" | "week" | "month" | "year";

export default function SalesChart() {
  const [mode, setMode] = useState<Mode>("month");
  // reference date – the day the user is “looking at”
  const [referenceDate, setReferenceDate] = useState<Date | undefined>(
    new Date()
  );

  const {
    data: sales = [],
    isLoading,
    isFetching,
  } = useChartSalesData(mode, referenceDate);

  const groupedData = useMemo(() => {
    if (!sales.length) return [];

    const map: Record<
      string,
      { label: string; total: number; quantity: number }
    > = {};

    for (const s of sales) {
      const d = new Date(s.date);
      if (isNaN(d.getTime())) continue;

      let key: string;
      let label: string;

      if (mode === "year") {
        key = `${d.getFullYear()}`;
        label = key;
      } else if (mode === "month") {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        label = format(d, "MMM yyyy");
      } else if (mode === "week") {
        const week = getISOWeek(d);
        key = `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
        label = `W${week} ${d.getFullYear()}`;
      } else {
        // day
        key = d.toISOString().slice(0, 10);
        label = format(d, "dd MMM");
      }

      if (!map[key]) map[key] = { label, total: 0, quantity: 0 };
      map[key].total += s.total;
      map[key].quantity += s.quantity;
    }

    return Object.values(map).sort((a, b) => a.label.localeCompare(b.label));
  }, [sales, mode]);

  // -----------------------------------------------------------------
  // UI helpers
  // -----------------------------------------------------------------
  const modeLabel =
    mode === "day"
      ? "Day"
      : mode === "week"
      ? "Week"
      : mode === "month"
      ? "Month"
      : "Year";

  const calendarTitle = (() => {
    if (!referenceDate) return "";
    switch (mode) {
      case "day":
        return format(referenceDate, "dd MMM yyyy");
      case "week":
        const week = getISOWeek(referenceDate);
        return `Week ${week}, ${referenceDate.getFullYear()}`;
      case "month":
        return format(referenceDate, "MMM yyyy");
      case "year":
        return `${referenceDate.getFullYear()}`;
    }
  })();

  // -----------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------
  if (isLoading && !isFetching) {
    return (
      <div className="w-full bg-white rounded-xl shadow-md border border-gray-100 p-4 h-80 flex items-center justify-center">
        <div className="text-gray-500">Loading chart data...</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl shadow-md border border-gray-100 p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
        <div className="text-lg font-medium">Sales Overview</div>

        {/* ---- Granularity selector ---- */}
        <Select value={mode} onValueChange={(v) => setMode(v as Mode)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Daily</SelectItem>
            <SelectItem value="week">Weekly</SelectItem>
            <SelectItem value="month">Monthly</SelectItem>
            <SelectItem value="year">Yearly</SelectItem>
          </SelectContent>
        </Select>

        {/* ---- Date picker (popover calendar) ---- */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[180px] justify-start text-left font-normal"
            >
              {calendarTitle || "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={referenceDate}
              onSelect={setReferenceDate}
              // For month/year mode we only need month/year selection,
              // but the default calendar works fine – it just picks a day.
              // You can replace with a custom month/year picker if you want.
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Show a subtle spinner while refetching after a mode/date change */}
      {isFetching && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-xl">
          <div className="text-sm text-gray-500">Updating…</div>
        </div>
      )}

      <div style={{ minHeight: 260, width: "100%" }} className="relative">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={groupedData}
            margin={{ top: 10, right: 40, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" fontSize={12} />
            <YAxis
              yAxisId="left"
              orientation="left"
              fontSize={12}
              width={60}
              tickFormatter={(v) => `₨${v}`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              fontSize={12}
              width={60}
              tickFormatter={(v) => `${v}Kg`}
            />
            <Tooltip
              formatter={(v: any, name) =>
                name === "total" ? `₨${v}` : `${v} Kg`
              }
            />
            <Legend
              payload={[
                { value: "Sales (₨)", type: "rect", color: "#059669" },
                { value: "Quantity (Kg)", type: "rect", color: "#f59e42" },
              ]}
            />
            <Bar yAxisId="left" dataKey="total" fill="#059669" radius={4} />
            <Bar yAxisId="right" dataKey="quantity" fill="#f59e42" radius={4} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ---------- ISO week helper (unchanged) ---------- */
function getISOWeek(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
