import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Shirt } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import Button from '@/components/ui/Button';

type LoginRole = 'leader' | 'worker';

export default function LoginPage() {
  const [role, setRole] = useState<LoginRole>('leader');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { loginWithApi, login: setAuth, logout } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const worker = await loginWithApi({ workerNo: username, password });

      if (role === 'leader' && worker.role !== 'leader') {
        setError('该账号没有组长权限');
        logout();
        return;
      }

      if (role === 'worker' && worker.role !== 'worker') {
        setError('请使用工人账号登录');
        logout();
        return;
      }

      setAuth(worker);

      if (worker.role === 'leader') {
        navigate('/leader/dashboard');
      } else {
        navigate('/worker/home');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '登录失败，请重试';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4">
            <Shirt className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">服装厂计件看板</h1>
          <p className="text-primary-200 mt-2">登录以继续使用系统</p>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
          <div className="flex mb-6 bg-slate-100 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setRole('leader')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                role === 'leader'
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              组长登录
            </button>
            <button
              type="button"
              onClick={() => setRole('worker')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                role === 'worker'
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              工人登录
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {role === 'leader' ? '组长账号' : '工号'}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={role === 'leader' ? '请输入账号' : '请输入工号'}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 text-rose-600 text-sm rounded-lg">
                {error}
              </div>
            )}

            <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
              登录
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs text-center text-slate-400">
              {role === 'leader'
                ? '演示账号：admin / 123456'
                : '演示工号：001 / 123456'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
