import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Shirt,
  PlusCircle,
  BarChart3,
  FileSpreadsheet,
  LogOut,
  User,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

const navItems = [
  { path: '/leader/dashboard', label: '生产看板', icon: LayoutDashboard },
  { path: '/leader/styles', label: '款号管理', icon: Shirt },
  { path: '/leader/entry', label: '产量录入', icon: PlusCircle },
  { path: '/leader/reports', label: '统计报表', icon: BarChart3 },
  { path: '/leader/export', label: '月底结算', icon: FileSpreadsheet },
];

export default function LeaderLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-primary-800 text-white flex flex-col shadow-xl">
        <div className="p-6 border-b border-primary-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-500 rounded-lg flex items-center justify-center">
              <Shirt className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold">计件看板</h1>
              <p className="text-xs text-primary-200">服装厂管理系统</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-700 text-white shadow-inner'
                        : 'text-primary-100 hover:bg-primary-700/50 hover:text-white'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-primary-700">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {currentUser?.name}
              </p>
              <p className="text-xs text-primary-300">
                {currentUser?.role === 'leader' ? '组长' : '工人'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-primary-100 hover:bg-primary-700/50 hover:text-white rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            退出登录
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
