import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Users, Map, Briefcase } from "lucide-react";

const PlannerLayout = () => {
  const navItems = [
    { to: "/planner", icon: <LayoutDashboard className="w-5 h-5 mr-3" />, label: "The 'Ilana' Dashboard", end: true },
    { to: "/planner/tme-matrix", icon: <Users className="w-5 h-5 mr-3" />, label: "Time-Money-Energy" },
    { to: "/planner/roadmap", icon: <Map className="w-5 h-5 mr-3" />, label: "Compliance Roadmap" },
    { to: "/planner/admin", icon: <Briefcase className="w-5 h-5 mr-3" />, label: "Admin & Ops" },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Permanent Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col hidden md:flex">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold tracking-tight text-primary">Blueprint</h2>
          <p className="text-sm text-muted-foreground mt-1">Business Planner</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-md transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
          <div>
            <h2 className="text-xl font-bold text-primary">Blueprint</h2>
            <p className="text-xs text-muted-foreground">Business Planner</p>
          </div>
          {/* Add a simple mobile menu or just rely on the main app's bottom nav if appropriate, 
              but the spec asks for a permanent sidebar so we'll leave it as a header for now on mobile. */}
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PlannerLayout;
