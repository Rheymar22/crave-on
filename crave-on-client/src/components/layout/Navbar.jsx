import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
} from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { getTotalItems } = useCartStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const totalItems = getTotalItems();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src="/crave on.jpg"
              alt="Crave On"
              className="w-9 h-9 rounded-lg object-cover"
            />
            <span className="font-display font-bold text-xl text-coffee-dark">
              Crave On
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/menu"
              title="Menu"
              className="flex flex-col items-center gap-0.5 px-3 py-2 text-gray-600
                         hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
            >
              <UtensilsCrossed className="w-5 h-5" />
              <span className="text-xs font-medium">Menu</span>
            </Link>

            {isAuthenticated && (
              <Link
                to="/orders"
                title="My Orders"
                className="flex flex-col items-center gap-0.5 px-3 py-2 text-gray-600
                           hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
              >
                <ClipboardList className="w-5 h-5" />
                <span className="text-xs font-medium">Orders</span>
              </Link>
            )}

            {user?.role === "admin" && (
              <Link
                to="/admin"
                title="Dashboard"
                className="flex flex-col items-center gap-0.5 px-3 py-2 text-gray-600
                           hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span className="text-xs font-medium">Dashboard</span>
              </Link>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {(!user || user.role === "customer") && (
              <Link
                to="/cart"
                className="relative p-2 text-gray-600 hover:text-brand-600
                           hover:bg-brand-50 rounded-lg transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-500
                                   text-white text-xs font-bold rounded-full
                                   flex items-center justify-center">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </Link>
            )}

            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                             hover:bg-gray-100 transition-colors"
                >
                  <div className="w-7 h-7 bg-brand-100 rounded-full flex items-center
                                  justify-center">
                    <User className="w-4 h-4 text-brand-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user?.name?.split(" ")[0]}
                  </span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-500"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                  Login
                </Button>
                <Button size="sm" onClick={() => navigate("/register")}>
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile toggle */}
            <button
              className="md:hidden p-2 text-gray-500 hover:text-brand-600
                         hover:bg-brand-50 rounded-lg transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden py-3 border-t border-gray-100 space-y-1">
            <Link
              to="/menu"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700
                         hover:bg-brand-50 hover:text-brand-600 rounded-lg"
              onClick={() => setMobileOpen(false)}
            >
              <UtensilsCrossed className="w-4 h-4" />
              Menu
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/orders"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700
                             hover:bg-brand-50 hover:text-brand-600 rounded-lg"
                  onClick={() => setMobileOpen(false)}
                >
                  <ClipboardList className="w-4 h-4" />
                  My Orders
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700
                             hover:bg-brand-50 hover:text-brand-600 rounded-lg"
                  onClick={() => setMobileOpen(false)}
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                {user?.role === "admin" && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700
                               hover:bg-brand-50 hover:text-brand-600 rounded-lg"
                    onClick={() => setMobileOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm
                             text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-4 py-2.5 text-sm text-gray-700
                             hover:bg-brand-50 rounded-lg"
                  onClick={() => setMobileOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-2.5 text-sm text-brand-600
                             font-medium hover:bg-brand-50 rounded-lg"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}