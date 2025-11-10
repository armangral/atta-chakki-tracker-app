// src/hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  attaChakkiService,
  ProductResponse,
  ProductCreateDto,
  ProductUpdateDto,
} from "@/services/attachakkiservice";
import { toast } from "@/components/ui/sonner";

// Query keys
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters?: any) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  categories: () => [...productKeys.all, "categories"] as const,
  lowStock: () => [...productKeys.all, "low-stock"] as const,
  active: () => [...productKeys.all, "active"] as const,
};

// Fetch all products with filters
export function useProducts(params?: {
  search?: string;
  category?: string;
  status?: "active" | "inactive";
  low_stock_only?: boolean;
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => attaChakkiService.listProducts(params),
    staleTime: 30000, // 30 seconds
  });
}

// Fetch single product
export function useProduct(productId: string) {
  return useQuery({
    queryKey: productKeys.detail(productId),
    queryFn: () => attaChakkiService.getProduct(productId),
    enabled: !!productId,
  });
}

// Fetch categories
export function useCategories() {
  return useQuery({
    queryKey: productKeys.categories(),
    queryFn: () => attaChakkiService.getCategories(),
    staleTime: 60000, // 1 minute
  });
}

// Fetch low stock products
export function useLowStockProducts() {
  return useQuery({
    queryKey: productKeys.lowStock(),
    queryFn: () => attaChakkiService.getLowStock(),
  });
}

// Fetch active products
export function useActiveProducts() {
  return useQuery({
    queryKey: productKeys.active(),
    queryFn: () => attaChakkiService.getActive(),
  });
}

// Create product mutation
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductCreateDto) =>
      attaChakkiService.createProduct(data),
    onSuccess: (newProduct) => {
      // Invalidate and refetch products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.categories() });
      toast.success("Product created successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Failed to create product");
    },
  });
}

// Update product mutation
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductUpdateDto }) =>
      attaChakkiService.updateProduct(id, data),
    onSuccess: (updatedProduct, variables) => {
      // Update cache
      queryClient.setQueryData(
        productKeys.detail(variables.id),
        updatedProduct
      );
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.categories() });
      toast.success("Product updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Failed to update product");
    },
  });
}

// Delete product mutation
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) =>
      attaChakkiService.deleteProduct(productId),
    onSuccess: (_, productId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: productKeys.detail(productId) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success("Product deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Failed to delete product");
    },
  });
}

// Update stock mutation
export function useUpdateStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, stock }: { id: string; stock: number }) =>
      attaChakkiService.updateStock(id, { stock }),
    onSuccess: (updatedProduct, variables) => {
      // Update cache
      queryClient.setQueryData(
        productKeys.detail(variables.id),
        updatedProduct
      );
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.lowStock() });
      toast.success("Stock updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Failed to update stock");
    },
  });
}
