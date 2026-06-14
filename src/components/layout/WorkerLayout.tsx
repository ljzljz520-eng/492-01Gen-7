import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Clock, User, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

const navItems = [
  { path: '/worker/home', label: '首页', icon: Home },
  { path: '/worker/history', label: '记录', icon: Clock },
  { path: '/worker/profile', label: '我的', icon: User },
];

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto">
      <main className="flex-1 pb-20 overflow-auto">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-200 shadow-lg z-50">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                  isActive ? 'text-primary-600' : 'text-slate-400'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center flex-1 h-full gap-1 text-slate-400 hover:text-rose-500 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-xs font-medium">退出</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
