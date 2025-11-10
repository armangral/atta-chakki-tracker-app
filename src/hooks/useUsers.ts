import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  attaChakkiService,
  UserResponse,
  UsersListResponse,
  UserSelfUpdateDto,
  UserAdminUpdateDto,
  UUID,
  PaginationParams,
  RoleAssignmentResponse,
  UserCreateDto,
} from "@/services/attachakkiservice";
import { toast } from "@/components/ui/sonner";

/* -------------------------------------------------------------------------- */
/*  Query keys                                                                */
/* -------------------------------------------------------------------------- */
export const userKeys = {
  all: ["users"] as const,
  me: () => [...userKeys.all, "me"] as const,
  list: (params?: PaginationParams) =>
    [...userKeys.all, "list", params] as const,
  detail: (id: UUID) => [...userKeys.all, "detail", id] as const,
  operators: () => [...userKeys.all, "operators"] as const,
};

/* ------------------- Current user ------------------- */
export function useMe() {
  return useQuery<UserResponse>({
    queryKey: userKeys.me(),
    queryFn: attaChakkiService.getMe,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

/* ------------------- List users (admin) ------------------- */
export function useUsers(params?: PaginationParams) {
  return useQuery<UsersListResponse>({
    queryKey: userKeys.list(params),
    queryFn: () => attaChakkiService.listUsers(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: 1,
  });
}

/* ------------------- Single user (admin) ------------------- */
export function useUser(userId: UUID) {
  return useQuery<UserResponse>({
    queryKey: userKeys.detail(userId),
    queryFn: () => attaChakkiService.getUser(userId),
    enabled: !!userId,
    staleTime: 60_000,
    retry: 1,
  });
}

/* ------------------- Operators list (admin) ------------------- */
export function useOperators() {
  return useQuery<UserResponse[]>({
    queryKey: userKeys.operators(),
    queryFn: attaChakkiService.listOperators,
    staleTime: 60_000,
    retry: 1,
  });
}

/* ------------------- Update own profile ------------------- */
export function useUpdateMe() {
  const qc = useQueryClient();

  return useMutation<UserResponse, unknown, UserSelfUpdateDto>({
    mutationFn: attaChakkiService.updateMe,
    onSuccess: (data) => {
      qc.setQueryData(userKeys.me(), data);
      toast.success("Profile updated successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail ?? "Failed to update profile");
    },
  });
}

/* ------------------- Update any user (admin) ------------------- */
export function useUpdateUser() {
  const qc = useQueryClient();

  return useMutation<
    UserResponse,
    unknown,
    { id: UUID; data: UserAdminUpdateDto }
  >({
    mutationFn: ({ id, data }) => attaChakkiService.updateUser(id, data),
    onSuccess: (updated, { id }) => {
      qc.setQueryData(userKeys.detail(id), updated);
      qc.invalidateQueries({ queryKey: userKeys.all });
      toast.success("User updated successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail ?? "Failed to update user");
    },
  });
}

/* ------------------- Delete user (admin) ------------------- */
export function useDeleteUser() {
  const qc = useQueryClient();

  return useMutation<void, unknown, UUID>({
    mutationFn: attaChakkiService.deleteUser,
    onSuccess: (_, userId) => {
      qc.removeQueries({ queryKey: userKeys.detail(userId) });
      qc.invalidateQueries({ queryKey: userKeys.all });
      toast.success("User deleted successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail ?? "Failed to delete user");
    },
  });
}

/* ------------------- Assign role (admin) ------------------- */
export function useAssignRole() {
  const qc = useQueryClient();

  return useMutation<
    RoleAssignmentResponse,
    unknown,
    { userId: UUID; role: string }
  >({
    mutationFn: ({ userId, role }) =>
      attaChakkiService.assignRole(userId, role),
    onSuccess: (_, { userId }) => {
      qc.invalidateQueries({ queryKey: userKeys.detail(userId) });
      qc.invalidateQueries({ queryKey: userKeys.all });
      toast.success(`Role assigned`);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail ?? "Failed to assign role");
    },
  });
}

/* ------------------- Revoke role (admin) ------------------- */
export function useRevokeRole() {
  const qc = useQueryClient();

  return useMutation<
    RoleAssignmentResponse,
    unknown,
    { userId: UUID; role: string }
  >({
    mutationFn: ({ userId, role }) =>
      attaChakkiService.revokeRole(userId, role),
    onSuccess: (_, { userId }) => {
      qc.invalidateQueries({ queryKey: userKeys.detail(userId) });
      qc.invalidateQueries({ queryKey: userKeys.all });
      toast.success(`Role revoked`);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail ?? "Failed to revoke role");
    },
  });
}

/* ------------------- Create user (admin only) ------------------- */
export function useCreateUser() {
  const qc = useQueryClient();

  return useMutation<UserResponse, unknown, UserCreateDto>({
    mutationFn: attaChakkiService.createUser,
    onSuccess: (newUser) => {
      // Optionally set in detail cache
      qc.setQueryData(userKeys.detail(newUser.id), newUser);
      // Invalidate list & operators
      qc.invalidateQueries({ queryKey: userKeys.all });
      toast.success("User created successfully!");
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.detail?.[0]?.msg ||
        err?.response?.data?.detail ||
        "Failed to create user";
      toast.error(msg);
    },
  });
}
