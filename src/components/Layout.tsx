import { Outlet, NavLink, Link } from "react-router-dom";
import { Leaf, Home, Camera, History, ScanLine } from "lucide-react";

export default function Layout() {
  const navItems = [
    { to: "/", label: "Home", icon: Home },
    { to: "/detect", label: "Detect", icon: Camera },
    { to: "/history", label: "History", icon: History },
  ];

  return (
    <div className="min-h-screen flex flex-col leaf-pattern">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-brand-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center shadow-md shadow-brand-600/30 group-hover:scale-105 transition-transform">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-brand-800 tracking-tight">
                CropCare <span className="text-brand-500">AI</span>
              </span>
            </Link>

            <nav className="flex items-center gap-1 sm:gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-brand-100 text-brand-700"
                        : "text-brand-600 hover:bg-brand-50 hover:text-brand-700"
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <Outlet />
      </main>

      <footer className="border-t border-brand-100 bg-white/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-brand-600">
              <ScanLine className="w-4 h-4" />
              <span className="text-sm font-medium">CropCare AI — Early disease detection for healthier harvests</span>
            </div>
            <p className="text-xs text-brand-400">
              For informational purposes. Always consult a local agricultural expert.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
