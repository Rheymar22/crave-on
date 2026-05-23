import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, ShoppingBag,
  BarChart3, LogOut, Tag, Menu,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/admin',            label: 'Dashboard',  icon: LayoutDashboard, exact: true },
  { to: '/admin/products',   label: 'Products',   icon: ShoppingBag },
  { to: '/admin/categories', label: 'Categories', icon: Tag },
  { to: '/admin/orders',     label: 'Orders',     icon: ShoppingBag },
  { to: '/admin/analytics',  label: 'Analytics',  icon: BarChart3 },
];

export function AdminSidebar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (item) =>
    item.exact ? pathname === item.to : pathname.startsWith(item.to);

  return (
    <aside className={cn(
      'flex flex-col bg-coffee-dark text-white min-h-screen transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <img
              src="/crave on.jpg"
              alt="Crave On"
              className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
            />
            <div>
              <p className="font-display font-bold text-sm">Crave On</p>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* Admin Info */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-white/10">
          <p className="text-xs text-gray-400">Logged in as</p>
          <p className="text-sm font-medium truncate">{user?.name}</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <Link
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg',
                'transition-all duration-200 text-sm font-medium',
                active
                  ? 'bg-brand-500 text-white'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10">
        <Link to="/"
          title={collapsed ? 'View Store' : undefined}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg
                     text-gray-300 hover:bg-white/10 hover:text-white
                     transition-colors text-sm mb-1">
          <ShoppingBag className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>View Store</span>}
        </Link>

        <button onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                     text-gray-300 hover:bg-red-500/20 hover:text-red-400
                     transition-colors text-sm">
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}