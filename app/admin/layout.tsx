import { requireSuperAdmin } from "@/lib/auth/super-admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Building2,
  Activity,
  Heart,
  Settings,
  LogOut,
  DollarSign,
  BarChart3,
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireSuperAdmin();
  } catch {
    redirect("/dashboard");
  }

  const navItems = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/admin/revenue",
      label: "Revenue",
      icon: DollarSign,
    },
    {
      href: "/admin/users",
      label: "Users",
      icon: Users,
    },
    {
      href: "/admin/organizations",
      label: "Organizations",
      icon: Building2,
    },
    {
      href: "/admin/monitoring",
      label: "Monitoring",
      icon: BarChart3,
    },
    {
      href: "/admin/activity",
      label: "Activity Logs",
      icon: Activity,
    },
    {
      href: "/admin/health",
      label: "System Health",
      icon: Heart,
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-64 bg-gray-900 border-r border-gray-700 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-red-500" />
            Super Admin
          </h1>
          <p className="text-xs text-gray-400 mt-1">Publio Control Panel</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Back to App</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
