// src/hooks/useChartSalesData.ts
import { useQuery } from "@tanstack/react-query";
import { attaChakkiService } from "@/services/attachakkiservice";
import { toNum } from "./useDashboardData";

export type ChartSale = {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  total: number;
  date: string; // ISO
};

type Mode = "day" | "week" | "month" | "year";

/**
 * Helper – returns { start, end } in format: YYYY-MM-DDTHH:MM:SS
 * No milliseconds, no timezone (assumes local time)
 */
function getRangeForMode(
  mode: Mode,
  referenceDate: Date = new Date()
): { start: string; end: string } {
  const start = new Date(referenceDate);
  const end = new Date(referenceDate);

  // Reset time for clean boundaries
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  switch (mode) {
    case "day":
      // today only
      break;

    case "week": {
      const day = start.getDay(); // 0 = Sun
      const diffToMon = day === 0 ? -6 : 1 - day;
      start.setDate(start.getDate() + diffToMon);
      end.setDate(start.getDate() + 6);
      break;
    }

    case "month":
      start.setDate(1);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0); // last day of month
      break;

    case "year":
      start.setMonth(0, 1); // Jan 1
      end.setFullYear(end.getFullYear(), 11, 31); // Dec 31
      break;
  }

  // Custom formatter: YYYY-MM-DDTHH:MM:SS
  const formatDate = (d: Date): string => {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate()
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  return {
    start: formatDate(start),
    end: formatDate(end),
  };
}

/**
 * Hook – fetches sales data for chart with correct date format
 */
export function useChartSalesData(mode: Mode, referenceDate?: Date) {
  const queryKey = ["sales", "chart", mode, referenceDate?.toISOString()];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const { start, end } = getRangeForMode(mode, referenceDate);

      const resp = await attaChakkiService.listSales({
        start_date: start,
        end_date: end,
        page_size: 100,
      });

      return (
        resp?.sales?.map((s) => ({
          ...s,
          quantity: toNum(s.quantity),
          total: toNum(s.total),
          date: s.date,
        })) ?? []
      );
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    keepPreviousData: true,
  });
}
