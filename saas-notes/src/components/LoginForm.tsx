"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));
        router.push("/dashboard");
      } else {
        setError(data.error || "Login failed");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const testAccounts = [
    { email: "admin@acme.test", role: "Admin", tenant: "Acme" },
    { email: "user@acme.test", role: "Member", tenant: "Acme" },
    { email: "admin@globex.test", role: "Admin", tenant: "Globex" },
    { email: "user@globex.test", role: "Member", tenant: "Globex" },
  ];

  return (
    <div className="w-full max-w-md bg-white p-6 rounded shadow-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-blue-900">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-blue-900">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded disabled:opacity-50 transition-colors"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {/* Quick test buttons */}
      <div className="mt-8">
        <h3 className="text-blue-800 font-semibold mb-2">Test Accounts</h3>
        {testAccounts.map((a) => (
          <button
            key={a.email}
            onClick={() => {
              setEmail(a.email);
              setPassword("password");
            }}
            className="block w-full p-2 bg-gray-100 hover:bg-gray-200 text-blue-700 text-sm rounded mb-1 transition-colors"
          >
            {a.email} ({a.role} - {a.tenant})
          </button>
        ))}
        <span className="text-xs text-gray-500">
          All accounts use password:{" "}
          <span className="text-blue-700">password</span>
        </span>
      </div>
    </div>
  );
}
