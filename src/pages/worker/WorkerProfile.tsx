import { User, LogOut, Info, Settings, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useWorkerStore } from '@/store/useWorkerStore';

export default function WorkerProfile() {
  const { currentUser, logout } = useAuthStore();
  const { getWorkerById } = useWorkerStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const worker = currentUser ? getWorkerById(currentUser.id) : null;

  return (
    <div className="pb-4 animate-fade-in">
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 pt-12 pb-16 px-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{worker?.name}</h1>
            <p className="text-primary-200 text-sm">工号：{worker?.workerNo}</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-8 relative z-10 space-y-4">
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">个人信息</h2>
        </div>
          <div className="divide-y divide-slate-50">
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-slate-700">工号</span>
            </div>
            <span className="text-slate-500 font-mono">{worker?.workerNo}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-slate-700">姓名</span>
            </div>
            <span className="text-slate-500">{worker?.name}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center">
                <Info className="w-4 h-4 text-orange-600" />
              </div>
              <span className="text-slate-700">职位</span>
            </div>
            <span className="text-slate-500">
              {worker?.role === 'leader' ? '组长' : '工人'}
            </span>
          </div>
        </div>
        </div>

        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">设置</h2>
          </div>
          <div className="divide-y divide-slate-50">
            <button className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-violet-50 rounded-lg flex items-center justify-center">
                  <Settings className="w-4 h-4 text-violet-600" />
                </div>
                <span className="text-slate-700">修改密码</span>
              </div>
              <span className="text-slate-400 text-sm">暂未开通</span>
            </button>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-white rounded-xl shadow-card py-4 text-rose-500 font-medium flex items-center justify-center gap-2 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          退出登录
        </button>

        <p className="text-center text-xs text-slate-400 text-center pt-4">
          版本 1.0.0
        </p>
      </div>
    </div>
  );
}
