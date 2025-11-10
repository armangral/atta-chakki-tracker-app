// src/hooks/useSales.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  attaChakkiService,
  SaleResponse,
  SaleCreateDto,
  SaleUpdateDto,
  CheckoutDto,
  UUID,
} from "@/services/attachakkiservice";
import { toast } from "@/components/ui/sonner";

// Query keys
export const saleKeys = {
  all: ["sales"] as const,
  lists: () => [...saleKeys.all, "list"] as const,
  list: (filters?: any) => [...saleKeys.lists(), filters] as const,
  details: () => [...saleKeys.all, "detail"] as const,
  detail: (id: UUID) => [...saleKeys.details(), id] as const,
  bills: () => [...saleKeys.all, "bill"] as const,
  bill: (id: UUID) => [...saleKeys.bills(), id] as const,
};

// Fetch all sales with filters
export function useSales(params?: {
  product_id?: UUID;
  operator_id?: UUID;
  bill_id?: UUID;
  start_date?: string;
  end_date?: string;
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}) {
  return useQuery({
    queryKey: saleKeys.list(params),
    queryFn: () => attaChakkiService.listSales(params),
    staleTime: 30000, // 30 seconds
  });
}

// Fetch single sale
export function useSale(saleId: UUID) {
  return useQuery({
    queryKey: saleKeys.detail(saleId),
    queryFn: () => attaChakkiService.getSale(saleId),
    enabled: !!saleId,
  });
}

// Fetch bill details
export function useBill(billId: UUID) {
  return useQuery({
    queryKey: saleKeys.bill(billId),
    queryFn: () => attaChakkiService.getBill(billId),
    enabled: !!billId,
  });
}

// Create sale mutation
export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SaleCreateDto) => attaChakkiService.createSale(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      // Also invalidate products to update stock
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Sale created successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Failed to create sale");
    },
  });
}

// Update sale mutation
export function useUpdateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: UUID; data: SaleUpdateDto }) =>
      attaChakkiService.updateSale(id, data),
    onSuccess: (updatedSale, variables) => {
      queryClient.setQueryData(saleKeys.detail(variables.id), updatedSale);
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Sale updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Failed to update sale");
    },
  });
}

// Delete sale mutation
export function useDeleteSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (saleId: UUID) => attaChakkiService.deleteSale(saleId),
    onSuccess: (_, saleId) => {
      queryClient.removeQueries({ queryKey: saleKeys.detail(saleId) });
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Sale deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Failed to delete sale");
    },
  });
}

// Checkout mutation (for multiple items)
export function useCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CheckoutDto) => attaChakkiService.checkout(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Checkout completed successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.detail || "Failed to process checkout"
      );
    },
  });
}
