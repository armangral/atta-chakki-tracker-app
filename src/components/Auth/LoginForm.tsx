
import { useState } from "react";

export default function LoginForm({ role, onLogin }: { role: "admin" | "operator"; onLogin: () => void }) {
  const [user, setUser] = useState("");
  const [pwd, setPwd] = useState("");

  return (
    <form
      className="max-w-sm mx-auto bg-white p-8 rounded-lg shadow-lg mt-20 flex flex-col gap-6"
      onSubmit={e => {
        e.preventDefault();
        onLogin();
      }}
    >
      <div className="text-2xl font-bold mb-2">{role === "admin" ? "Admin Login" : "Operator Login"}</div>
      <input
        className="border p-3 rounded font-semibold"
        value={user}
        onChange={e => setUser(e.target.value)}
        placeholder="Username"
        required
      />
      <input
        className="border p-3 rounded font-semibold"
        type="password"
        value={pwd}
        onChange={e => setPwd(e.target.value)}
        placeholder={role === "admin" ? "Password" : "PIN/Password"}
        required
      />
      <button type="submit" className="bg-emerald-700 py-3 rounded text-white font-bold text-lg hover:bg-emerald-800 transition">
        Login
      </button>
    </form>
  );
}
