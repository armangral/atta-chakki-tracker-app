"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import MainHeader from "@/components/Layout/MainHeader";
import { User, UserPlus, User2, UserX } from "lucide-react";
import BackButton from "@/components/BackButton";
import { toast } from "@/components/ui/sonner";

import {
  useUsers,
  useUpdateUser,
  useDeleteUser,
  useAssignRole,
  useRevokeRole,
  useCreateUser,
} from "@/hooks/useUsers";
import {
  UserResponse,
  UsersListResponse,
  UserCreateDto,
  UserAdminUpdateDto,
  UUID,
} from "@/services/attachakkiservice";

type UserRole = "admin" | "operator";

interface UserItem extends UserResponse {
  status: "active" | "inactive";
  role: UserRole;
}

export default function AdminUsers() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserItem | null>(null);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "operator" as UserRole,
  });

  // ────── Queries & Mutations ──────
  const {
    data: listData,
    isLoading,
    refetch,
  } = useUsers({ page: 1, page_size: 20 });

  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const assignRoleMutation = useAssignRole();
  const revokeRoleMutation = useRevokeRole();
  const createUserMutation = useCreateUser();

  // Transform API → UI format
  const userItems: UserItem[] = (listData?.users ?? []).map((user) => {
    const isAdmin = user.roles.some((r) => r.role === "admin");
    return {
      ...user,
      status: user.is_active ? "active" : "inactive",
      role: isAdmin ? "admin" : "operator",
    };
  });

  // ────── Dialog helpers ──────
  const openAdd = () => {
    setEditUser(null);
    setForm({ username: "", email: "", password: "", role: "operator" });
    setDialogOpen(true);
  };

  const openEdit = (user: UserItem) => {
    setEditUser(user);
    setForm({
      username: user.profile.username,
      email: user.email,
      password: "",
      role: user.role,
    });
    setDialogOpen(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ────── Submit ──────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editUser) {
        // ── UPDATE USER ──
        const updatePayload: UserAdminUpdateDto = {};
        if (form.email !== editUser.email) updatePayload.email = form.email;
        if (form.password) updatePayload.password = form.password;

        if (Object.keys(updatePayload).length > 0) {
          await updateUserMutation.mutateAsync({
            id: editUser.id,
            data: updatePayload,
          });
        }

        // ── ROLE CHANGE ──
        const targetRole = form.role;
        const currentRole = editUser.role;

        if (currentRole !== targetRole) {
          if (currentRole === "admin") {
            await revokeRoleMutation.mutateAsync({
              userId: editUser.id,
              role: "admin",
            });
          }
          if (targetRole === "admin") {
            await assignRoleMutation.mutateAsync({
              userId: editUser.id,
              role: "admin",
            });
          }
        }

        toast.success("User updated successfully!");
      } else {
        // ── CREATE USER ──
        const createPayload: UserCreateDto = {
          username: form.username,
          email: form.email,
          password: form.password,
        };
        await createUserMutation.mutateAsync(createPayload);
        toast.success("User created successfully!");
      }

      setDialogOpen(false);
      refetch();
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail?.[0]?.msg ||
        err?.response?.data?.detail ||
        err?.message ||
        "Operation failed";
      toast.error(msg);
    }
  };

  // ────── Delete ──────
  const handleDelete = async (userId: UUID) => {
    if (!confirm("Delete this user permanently?")) return;
    try {
      await deleteUserMutation.mutateAsync(userId);
      toast.success("User deleted");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to delete");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-emerald-50">
      <MainHeader userRole="admin" />
      <div className="max-w-5xl mx-auto px-4 pt-12">
        <BackButton />
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
            <User2 className="w-6 h-6" /> Users
          </h1>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={openAdd}
                size="sm"
                className="bg-amber-600 hover:bg-amber-700"
              >
                <UserPlus className="w-4 h-4 mr-2" /> Add User
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
              <form onSubmit={handleSubmit} className="space-y-4">
                <DialogHeader>
                  <DialogTitle>
                    {editUser ? "Edit User" : "Add New User"}
                  </DialogTitle>
                  <DialogDescription>
                    {editUser
                      ? "Update user information and role."
                      : "Fill in the details to create a new user."}
                  </DialogDescription>
                </DialogHeader>

                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    required
                    value={form.username}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    disabled={!!editUser}
                  />
                </div>

                <div>
                  <Label htmlFor="password">
                    Password {editUser && "(leave blank to keep current)"}
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    required={!editUser}
                    placeholder={editUser ? "••••••••" : ""}
                  />
                </div>

                <div>
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  >
                    <option value="operator">Operator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <DialogFooter className="gap-2">
                  <Button
                    type="submit"
                    disabled={
                      updateUserMutation.isPending ||
                      createUserMutation.isPending
                    }
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {editUser
                      ? updateUserMutation.isPending
                        ? "Saving..."
                        : "Save Changes"
                      : createUserMutation.isPending
                      ? "Creating..."
                      : "Create User"}
                  </Button>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* ────── Users Table ────── */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : userItems.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                userItems.map((user) => (
                  <TableRow
                    key={user.id}
                    className={user.status === "inactive" ? "opacity-60" : ""}
                  >
                    <TableCell className="font-medium">
                      {user.profile.username}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="capitalize">{user.role}</TableCell>
                    <TableCell className="capitalize">
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                          user.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(user)}
                        disabled={user.status === "inactive"}
                      >
                        <User className="w-3.5 h-3.5 mr-1" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(user.id)}
                        disabled={deleteUserMutation.isPending}
                      >
                        <UserX className="w-3.5 h-3.5 mr-1" /> Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
