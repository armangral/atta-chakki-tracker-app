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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import MainHeader from "@/components/Layout/MainHeader";
import { User, UserPlus, User2, UserX } from "lucide-react";
import BackButton from "@/components/BackButton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

type UserRole = "admin" | "operator";
type UserStatus = "active" | "inactive";

interface UserItem {
  id: string;           // uuid
  email: string;        // from auth.users
  name: string | null;  // from profiles.username
  role: UserRole;       // from user_roles
  status: UserStatus;   // "active"|"inactive" (from profiles or existence)
}

const fetchAllUsers = async (): Promise<UserItem[]> => {
  // get all users from auth.users via 'profiles' and join 'user_roles'.
  // profiles may have a nullable username, fallback to email
  // status is "active" if user still present and not explicitly inactive
  const { data: profiles, error: profileErr } = await supabase
    .from("profiles")
    .select("id,username");
  if (profileErr) throw new Error(profileErr.message);

  // get roles
  const { data: roles, error: rolesErr } = await supabase
    .from("user_roles")
    .select("user_id, role");
  if (rolesErr) throw new Error(rolesErr.message);

  // get email from auth.users via RPC (fetch via edge function or REST: We'll use Supabase admin API via edge, but for demo, we'll fetch by id)
  // Instead, fetch emails from public profiles: not stored by default, we fallback to their username or show id.

  // We'll try to get email as username (or fallback to id)
  const users: UserItem[] = profiles.map((p) => {
    const user_id = p.id;
    const roleObj = roles.find(r => r.user_id === user_id);
    // status: treat as "active" if profile exists
    return {
      id: user_id,
      name: p.username,
      email: p.username || user_id,
      role: (roleObj?.role as UserRole) ?? "operator",
      status: p.username === null ? "inactive" : "active",
    }
  });

  return users;
};

const runBackfill = async () => {
  // Run the one-off manual SQL (unwrap for code execution)
  // 1. Insert profiles for users not in profiles
  // 2. Insert user_roles for users not in user_roles
  try {
    await supabase.rpc('execute_sql', { 
      raw_sql: `
        INSERT INTO public.profiles (id, username)
        SELECT id, email FROM auth.users 
        WHERE id NOT IN (SELECT id FROM public.profiles);
        INSERT INTO public.user_roles (user_id, role)
        SELECT id, 'operator'::public.app_role FROM auth.users
        WHERE id NOT IN (SELECT user_id FROM public.user_roles);
      `
    });
  } catch (e: any) {
    // Ignore if function doesn't exist, as we only want to run the SQL if needed.
  }
};

export default function AdminUsers() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<{
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    password: string;
  }>({
    name: "",
    email: "",
    role: "operator",
    status: "active",
    password: "",
  });

  // Fetch users from backend, including a data "backfill" on mount
  const loadUsers = async () => {
    setLoading(true);
    try {
      // Run the one-off backfill on first load
      await runBackfill();
      const users = await fetchAllUsers();
      setUsers(users);
    } catch (e: any) {
      toast.error("Failed to fetch users: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  // Open dialog to add a user
  const handleAdd = () => {
    setForm({ name: "", email: "", role: "operator", status: "active", password: "" });
    setEditId(null);
    setDialogOpen(true);
  };

  // Open dialog to edit
  const handleEdit = (user: UserItem) => {
    setForm({
      name: user.name || "",
      email: user.email,
      role: user.role,
      status: user.status,
      password: "",
    });
    setEditId(user.id);
    setDialogOpen(true);
  };

  // Delete/deactivate user (sets inactive in profile)
  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      // Option 1: hard-delete profile (but can't delete auth.users except as admin).
      // Option 2: set profile.username to null as status "inactive"
      const { error } = await supabase
        .from("profiles")
        .update({ username: null /* null username = inactive */ })
        .eq("id", id);
      if (error) throw error;
      toast.success("User set to inactive.");
      await loadUsers();
    } catch (e: any) {
      toast.error("Failed to set inactive: " + e.message);
    }
    setLoading(false);
  };

  // React controlled input for form
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submit (add or edit)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        // Edit profile username. (Email cannot be updated unless via Supabase Auth Admin API, so we skip.)
        const { error: e1 } = await supabase.from("profiles").update({ username: form.name }).eq("id", editId);
        if (e1) throw e1;
        // Update role
        const { data: existingRole } = await supabase.from("user_roles").select("id").eq("user_id", editId).maybeSingle();
        if (existingRole) {
          await supabase.from("user_roles").update({ role: form.role }).eq("user_id", editId);
        } else {
          await supabase.from("user_roles").insert({ user_id: editId, role: form.role });
        }
        toast.success("User info updated!");
      } else {
        // Register user in Supabase Auth
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            emailRedirectTo: window.location.origin,
          }
        });
        if (error) throw error;
        const newUserId = data?.user?.id;
        if (!newUserId) throw new Error("SignUp failed.");
        // Insert username in profiles
        await supabase.from("profiles").upsert([{ id: newUserId, username: form.name }]);
        // Insert user_roles record
        await supabase.from("user_roles").insert({ user_id: newUserId, role: form.role });
        toast.success("User added!");
      }
      setDialogOpen(false);
      await loadUsers();
    } catch (e: any) {
      toast.error("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-emerald-50">
      <MainHeader userRole="admin" />
      <div className="max-w-3xl mx-auto px-4 pt-12">
        <BackButton />
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-amber-900 flex items-center gap-2"><User2 /> Users</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAdd} size="sm" className="bg-amber-600 text-white hover:bg-amber-700">
                <UserPlus className="mr-2" /> Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <DialogHeader>
                  <DialogTitle>{editId ? "Edit User" : "Add User"}</DialogTitle>
                  <DialogDescription>
                    {editId ? "Edit user details below." : "Enter details for the new user."}
                  </DialogDescription>
                </DialogHeader>
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" required value={form.name} onChange={handleFormChange} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required value={form.email} onChange={handleFormChange} disabled={!!editId} />
                </div>
                {!editId && (
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" required value={form.password} onChange={handleFormChange} />
                  </div>
                )}
                <div>
                  <Label htmlFor="role">Role</Label>
                  <select id="role" name="role" value={form.role} onChange={handleFormChange} className="w-full border rounded-md px-3 py-2">
                    <option value="admin">Admin</option>
                    <option value="operator">Operator</option>
                  </select>
                </div>
                <DialogFooter className="gap-2">
                  <Button type="submit" className="bg-emerald-600 text-white hover:bg-emerald-700" disabled={loading}>
                    {editId ? "Save" : "Add"}
                  </Button>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="bg-white border rounded-xl shadow-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">Loading...</TableCell>
                </TableRow>
              ) : (
                users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No users found.</TableCell>
                  </TableRow>
                ) : (
                  users.map(user => (
                    <TableRow key={user.id} className={user.status === "inactive" ? "opacity-50" : ""}>
                      <TableCell>{user.name || <span className="italic text-xs text-gray-400">No Name</span>}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="capitalize">{user.role}</TableCell>
                      <TableCell className="capitalize">{user.name === null ? "inactive" : "active"}</TableCell>
                      <TableCell className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(user)} disabled={user.status === "inactive"}>
                          <User className="w-4 h-4 mr-1" /> Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(user.id)} disabled={user.status === "inactive"}>
                          <UserX className="w-4 h-4 mr-1" /> Deactivate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
