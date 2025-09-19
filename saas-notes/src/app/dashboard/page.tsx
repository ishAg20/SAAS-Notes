"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Tenant } from "@/types";
import NotesManager from "@/components/NotesManager";
import UpgradeButton from "@/components/UpgradeButton";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (!token || !userStr) {
      router.push("/login");
      return;
    }
    try {
      const userData = JSON.parse(userStr);
      setUser(userData);
      setTenant(userData.tenant);
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
      return;
    }
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleUpgradeSuccess = () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const userData = JSON.parse(userStr);
      const updatedTenant = { ...userData.tenant, subscription: "PRO" };
      const updatedUser = { ...userData, tenant: updatedTenant };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setTenant(updatedTenant);
    }
  };

  if (loading) return <div className="text-blue-700">Loading...</div>;
  if (!user || !tenant) return null;

  return (
    <div className="p-6 text-blue-900 bg-gray-50 min-h-screen">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-blue-900 mb-1">
          {tenant.name} Dashboard
        </h1>
        <p className="text-sm text-blue-700 mb-3">
          {user.email} • {user.role} • {tenant.subscription} Plan
        </p>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </header>

      <main className="space-y-6">
        <UpgradeButton
          user={user}
          tenant={tenant}
          onUpgradeSuccess={handleUpgradeSuccess}
        />
        <NotesManager user={user} tenant={tenant} />
      </main>
    </div>
  );
}
