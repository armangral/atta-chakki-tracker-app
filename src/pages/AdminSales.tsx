"use client";

import { useState, useMemo } from "react";
import { toZonedTime, formatInTimeZone } from "date-fns-tz";
import {
  parseISO,
  format as formatPlain,
  startOfDay,
  endOfDay,
} from "date-fns";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

import BackButton from "@/components/BackButton";
import MainHeader from "@/components/Layout/MainHeader";
import SalesTableAdmin from "@/components/SalesTableAdmin";
import SaleFormDialog from "@/components/SaleFormDialog";

import { useSales, useDeleteSale } from "@/hooks/useSales";
import { useActiveProducts } from "@/hooks/useProducts";
import { useOperators } from "@/hooks/useUsers";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Download, Filter } from "lucide-react";

// ---------- TIMEZONE ----------
const PK_TIMEZONE = "Asia/Karachi";

// Convert UTC ISO string → PK Date object
const toPKDate = (utcIso: string): Date => {
  if (!utcIso) return new Date(NaN);

  const sanitized = utcIso.includes("Z") ? utcIso : `${utcIso}Z`;

  try {
    const parsed = parseISO(sanitized);
    return toZonedTime(parsed, PK_TIMEZONE);
  } catch (error) {
    console.warn("Invalid date string:", utcIso, error);
    return new Date(NaN);
  }
};

// Format PK Date → String safely
const formatPK = (date: Date | undefined, fmt: string): string => {
  if (!date || isNaN(date.getTime())) return "Invalid date";
  return formatInTimeZone(date, PK_TIMEZONE, fmt);
};

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export default function AdminSales() {
  const [isOpen, setIsOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // ---------- QUERY PARAMS: PK Date → UTC ISO ----------
  const queryParams = useMemo(() => {
    const params: any = {
      page: 1,
      page_size: 100,
      sort_by: "date",
      sort_order: "desc",
    };

    if (dateRange.from) {
      const pkStart = startOfDay(toZonedTime(dateRange.from, PK_TIMEZONE));
      params.start_date = formatInTimeZone(
        pkStart,
        "UTC",
        "yyyy-MM-dd'T'HH:mm:ss"
      );
    }

    if (dateRange.to) {
      const pkEnd = endOfDay(toZonedTime(dateRange.to, PK_TIMEZONE));
      params.end_date = formatInTimeZone(pkEnd, "UTC", "yyyy-MM-dd'T'HH:mm:ss");
    }

    return params;
  }, [dateRange]);

  // ---------- DATA ----------
  const {
    data: salesData,
    isLoading: salesLoading,
    error: salesError,
    refetch,
  } = useSales(queryParams);

  const { data: products = [], isLoading: productsLoading } =
    useActiveProducts();
  const { data: operators = [], isLoading: operatorsLoading } = useOperators();
  const deleteSaleMutation = useDeleteSale();

  // ---------- MAPPED SALES: UTC → PK (with Date + Formatted) ----------
  const sales = useMemo(() => {
    return (salesData?.sales || []).map((sale: any) => {
      const datePK = toPKDate(sale.date);
      const datePKFormatted = formatPK(datePK, "PPP"); // e.g., "Nov 10, 2025"

      return {
        ...sale,
        datePK, // Real Date in PK time (for sorting)
        datePKFormatted, // Human-readable string
        date: datePK, // Use for sorting in table
      };
    });
  }, [salesData?.sales]);

  // ---------- ACTIONS ----------
  const handleDeleteSale = (id: string) => {
    if (window.confirm("Are you sure you want to delete this sale?")) {
      deleteSaleMutation.mutate(id, { onSuccess: refetch });
    }
  };

  const handleApplyFilter = () => {
    setIsPopoverOpen(false);
    refetch();
  };

  const handleClearFilter = () => {
    setDateRange({ from: undefined, to: undefined });
    setIsPopoverOpen(false);
    refetch();
  };

  // ---------- EXPORT TO EXCEL ----------
  const handleExportToExcel = () => {
    if (sales.length === 0) {
      alert("No data to export.");
      return;
    }

    const exportData = sales.map((s) => ({
      Date: s.datePKFormatted,
      Product: s.product_name || "-",
      Quantity: s.quantity,
      "Unit Price": s.unit_price,
      Total: s.total,
      Operator: s.operator_name || "-",
      "Payment Method": s.payment_method || "-",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales");

    // Auto-size columns
    const colWidths = Object.keys(exportData[0]).map((key) => ({
      wch:
        Math.max(
          key.length,
          ...exportData.map(
            (row) => String(row[key as keyof typeof row]).length
          )
        ) + 2,
    }));
    ws["!cols"] = colWidths;

    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buf], { type: "application/octet-stream" });
    const fileName = `sales_report_${formatPK(new Date(), "yyyy-MM-dd")}.xlsx`;
    saveAs(blob, fileName);
  };

  // ---------- RENDER ----------
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-emerald-50">
      <MainHeader userRole="admin" />
      <div className="max-w-6xl mx-auto px-4 pt-10">
        <BackButton />
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">
              Sales Management
            </h1>
            <p className="text-gray-500">View, add, and delete sales records</p>
          </div>

          <div className="flex gap-2 flex-wrap">
            {/* ---- DATE FILTER ---- */}
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {formatPK(dateRange.from, "LLL dd")} -{" "}
                        {formatPK(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      formatPK(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Filter by date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(r: any) =>
                    setDateRange({ from: r?.from, to: r?.to })
                  }
                  numberOfMonths={2}
                  className="rounded-md border"
                />
                <div className="flex justify-between p-3 border-t">
                  <Button variant="ghost" size="sm" onClick={handleClearFilter}>
                    Clear
                  </Button>
                  <Button size="sm" onClick={handleApplyFilter}>
                    <Filter className="mr-1 h-4 w-4" />
                    Apply Filter
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* ---- EXPORT ---- */}
            <Button
              onClick={handleExportToExcel}
              disabled={salesLoading || sales.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Download className="mr-2 h-4 w-4" />
              Export to Excel
            </Button>

            {/* ---- ADD SALE ---- */}
            <SaleFormDialog
              products={products}
              operators={operators}
              productsLoading={productsLoading}
              operatorsLoading={operatorsLoading}
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              onSuccess={refetch}
            />
          </div>
        </div>

        {/* ---- TABLE ---- */}
        <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
          <SalesTableAdmin
            sales={sales.map((s) => ({
              ...s,
              date: s.datePK, // Real Date for sorting
              // Do NOT override with string
            }))}
            salesLoading={salesLoading}
            salesError={salesError}
            onDelete={handleDeleteSale}
            deletePending={deleteSaleMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
}
