import { useState } from "react";
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

type UserRole = "admin" | "operator";
type UserStatus = "active" | "inactive";

interface UserItem {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

const MOCK_USERS: UserItem[] = [
  { id: 1, name: "Rohan Singh", email: "rohan@chakki.com", role: "admin", status: "active" },
  { id: 2, name: "Vivek Gupta", email: "vivek@chakki.com", role: "operator", status: "active" },
  { id: 3, name: "Aisha Fatima", email: "aisha@chakki.com", role: "operator", status: "inactive" },
];

export default function AdminUsers() {
  const [users, setUsers] = useState<UserItem[]>(MOCK_USERS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<UserItem, "id">>({
    name: "",
    email: "",
    role: "operator",
    status: "active",
  });

  // Open dialog to add a user
  const handleAdd = () => {
    setForm({ name: "", email: "", role: "operator", status: "active" });
    setEditId(null);
    setDialogOpen(true);
  };

  // Open dialog to edit
  const handleEdit = (user: UserItem) => {
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setEditId(user.id);
    setDialogOpen(true);
  };

  // Delete user
  const handleDelete = (id: number) => {
    setUsers((prev) => prev.filter(u => u.id !== id));
  };

  // Handle form change
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submit (add or edit)
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      setUsers(users.map(u => u.id === editId ? { ...u, ...form } : u));
    } else {
      const maxId = users.reduce((max, u) => Math.max(max, u.id), 0);
      setUsers([{ id: maxId + 1, ...form }, ...users]);
    }
    setDialogOpen(false);
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
                  <Input id="email" name="email" type="email" required value={form.email} onChange={handleFormChange} />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <select id="role" name="role" value={form.role} onChange={handleFormChange} className="w-full border rounded-md px-3 py-2">
                    <option value="admin">Admin</option>
                    <option value="operator">Operator</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select id="status" name="status" value={form.status} onChange={handleFormChange} className="w-full border rounded-md px-3 py-2">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <DialogFooter className="gap-2">
                  <Button type="submit" className="bg-emerald-600 text-white hover:bg-emerald-700">{editId ? "Save" : "Add"}</Button>
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
              {users.map(user => (
                <TableRow key={user.id} className={user.status === "inactive" ? "opacity-50" : ""}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="capitalize">{user.role}</TableCell>
                  <TableCell className="capitalize">{user.status}</TableCell>
                  <TableCell className="flex gap-2 justify-end">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(user)}>
                      <User className="w-4 h-4 mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(user.id)}>
                      <UserX className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No users found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
