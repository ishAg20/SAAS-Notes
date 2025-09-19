"use client";
import { useState } from "react";
import { User, Tenant } from "@/types";

export default function UpgradeButton({
  user,
  tenant,
  onUpgradeSuccess,
}: {
  user: User;
  tenant: Tenant;
  onUpgradeSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleUpgrade = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("token");
    const response = await fetch(`/api/tenants/${tenant.slug}/upgrade`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (data.success) onUpgradeSuccess();
    else setError(data.error || "Failed to upgrade");
    setLoading(false);
  };
  if (tenant.subscription === "PRO")
    return <div className="bg-green-100 border px-4 py-2">Pro Plan Active</div>;
  if (user.role !== "ADMIN")
    return <div>Contact your admin to upgrade to Pro.</div>;
  return (
    <div className="bg-yellow-50 border p-4">
      <button onClick={handleUpgrade} disabled={loading}>
        {loading ? "Upgrading..." : "Upgrade to Pro"}
      </button>
      {error && <div className="text-red-600">{error}</div>}
    </div>
  );
}
