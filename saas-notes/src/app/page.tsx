import Link from "next/link";
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold mb-6 text-blue-900">
        Multi-Tenant Notes SaaS
      </h1>
      <p className="mb-8 text-blue-400">
        A secure, scalable notes app with role-based access and subscriptions.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg"
        >
          Get Started
        </Link>
        <Link
          href="/api/health"
          className="px-8 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg"
        >
          Health Check
        </Link>
      </div>
    </div>
  );
}
