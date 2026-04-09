import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { LayoutDashboard, Ticket, Users, Wrench, LogOut, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  const adminLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/requests", label: "All Requests", icon: Ticket },
    { href: "/admin/technicians", label: "Technicians", icon: Wrench },
    { href: "/admin/customers", label: "Customers", icon: Users },
  ];

  const technicianLinks = [
    { href: "/technician", label: "My Jobs", icon: Wrench },
  ];

  const customerLinks = [
    { href: "/customer", label: "My Requests", icon: Ticket },
    { href: "/customer/new-request", label: "New Request", icon: Activity },
  ];

  const links = user.role === "admin" ? adminLinks : user.role === "technician" ? technicianLinks : customerLinks;

  return (
    <div className="w-64 bg-slate-900 text-slate-100 flex flex-col h-screen fixed top-0 left-0 border-r border-slate-800">
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-teal-500" />
          Dispatch
        </h2>
        <div className="mt-4 flex flex-col">
          <span className="text-sm font-medium">{user.name}</span>
          <span className="text-xs text-slate-400 capitalize">{user.role}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {links.map((link) => {
            const isActive = location === link.href || (location.startsWith(link.href) && link.href !== "/admin" && link.href !== "/technician" && link.href !== "/customer");
            return (
              <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-teal-900/50 text-teal-400" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}>
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800">
        <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800" onClick={logout}>
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}
