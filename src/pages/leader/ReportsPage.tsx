import { useState, useMemo } from 'react';
import { BarChart3, Users, Calendar, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { useProductionStore } from '@/store/useProductionStore';
import { useWorkerStore } from '@/store/useWorkerStore';
import { useStyleStore } from '@/store/useStyleStore';
import { formatMoney, formatDate } from '@/utils/date';
import {
  calculateTotalQuantity,
  calculateTotalSalary,
} from '@/utils/salary';

export default function ReportsPage() {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');
  const records = useProductionStore((state) => state.records);
  const workers = useWorkerStore((state) => state.workers);
  const styles = useStyleStore((state) => state.styles);

  const chartData = useMemo(() => {
    if (period === 'day') {
      const today = formatDate(new Date());
      const dayRecords = records.filter((r) => r.date === today);
      const byHour: Record<number, { 产量: number; 工资: number }> = {};
      for (let i = 8; i <= 18; i++) {
        byHour[i] = { 产量: 0, 工资: 0 };
      }
      dayRecords.forEach((r) => {
        const hour = 9 + Math.floor(Math.random() * 9);
        byHour[hour] = byHour[hour] || { 产量: 0, 工资: 0 };
        byHour[hour].产量 += r.quantity;
        byHour[hour].工资 += r.amount;
      });
      return Object.entries(byHour).map(([hour, data]) => ({
        time: `${hour}时`,
        ...data,
      }));
    }

    if (period === 'week') {
      const data = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = formatDate(date);
        const dayRecords = records.filter((r) => r.date === dateStr);
        data.push({
          date: `${date.getMonth() + 1}/${date.getDate()}`,
          产量: calculateTotalQuantity(dayRecords),
          工资: calculateTotalSalary(dayRecords),
        });
      }
      return data;
    }

    if (period === 'month') {
      const data = [];
      const now = new Date();
      const daysInMonth = now.getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(now.getFullYear(), now.getMonth(), i);
        const dateStr = formatDate(date);
        const dayRecords = records.filter((r) => r.date === dateStr);
        data.push({
          date: `${i}日`,
          产量: calculateTotalQuantity(dayRecords),
          工资: calculateTotalSalary(dayRecords),
        });
      }
      return data;
    }

    return [];
  }, [records, period]);

  const workerStats = useMemo(() => {
    return workers
      .filter((w) => w.role === 'worker')
      .map((worker) => {
        const workerRecords = records.filter(
          (r) => r.workerId === worker.id
        );
        return {
          ...worker,
          quantity: calculateTotalQuantity(workerRecords),
          salary: calculateTotalSalary(workerRecords),
        };
      })
      .sort((a, b) => b.salary - a.salary);
  }, [workers, records]);

  const styleStats = useMemo(() => {
    return styles.map((style) => {
      const styleRecords = records.filter((r) => r.styleId === style.id);
      return {
        ...style,
        quantity: calculateTotalQuantity(styleRecords),
        salary: calculateTotalSalary(styleRecords),
      };
    });
  }, [styles, records]);

  const totalStats = useMemo(() => {
    const now = new Date();
    const today = formatDate(now);

    const todayRecords = records.filter((r) => r.date === today);
    const totalRecords = records;

    return {
      todayQuantity: calculateTotalQuantity(todayRecords),
      todaySalary: calculateTotalSalary(todayRecords),
      totalQuantity: calculateTotalQuantity(totalRecords),
      totalSalary: calculateTotalSalary(totalRecords),
    };
  }, [records]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">统计报表</h1>
          <p className="text-slate-500 mt-1">多维度数据分析和统计</p>
        </div>
        <div className="flex bg-slate-100 rounded-lg p-1">
          {[
            { key: 'day', label: '今日' },
            { key: 'week', label: '本周' },
            { key: 'month', label: '本月' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setPeriod(item.key as any)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                period === item.key
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-slate-500">今日产量</span>
          </div>
          <p className="text-2xl font-bold text-slate-800 font-mono">
            {totalStats.todayQuantity.toLocaleString()}
            <span className="text-sm font-normal text-slate-400 ml-2">件</span>
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-sm text-slate-500">今日工资</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600 font-mono">
            {formatMoney(totalStats.todaySalary)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm text-slate-500">累计产量</span>
          </div>
          <p className="text-2xl font-bold text-slate-800 font-mono">
            {totalStats.totalQuantity.toLocaleString()}
            <span className="text-sm font-normal text-slate-400 ml-2">件</span>
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-violet-600" />
            </div>
            <span className="text-sm text-slate-500">累计工资</span>
          </div>
          <p className="text-2xl font-bold text-violet-600 font-mono">
            {formatMoney(totalStats.totalSalary)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            产量趋势
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey={period === 'day' ? 'time' : 'date'} stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="产量"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            工资趋势
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey={period === 'day' ? 'time' : 'date'} stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value: number) => [formatMoney(value), '工资']}
                />
                <Bar
                  dataKey="工资"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            工人工资排行
          </h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {workerStats.map((worker, index) => (
              <div
                key={worker.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      index === 0
                        ? 'bg-amber-100 text-amber-600'
                        : index === 1
                        ? 'bg-slate-200 text-slate-600'
                        : index === 2
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-slate-800 text-sm">
                      {worker.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      工号：{worker.workerNo}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-semibold text-primary-600 text-sm">
                    {formatMoney(worker.salary)}
                  </p>
                  <p className="text-xs text-slate-400">
                    {worker.quantity} 件
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            款号产量统计
          </h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {styleStats.map((style, index) => {
              const maxQty = Math.max(...styleStats.map((s) => s.quantity), 1);
              const percentage = (style.quantity / maxQty) * 100;
              return (
                <div key={style.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500 w-6">
                        {index + 1}.
                      </span>
                      <span className="font-medium text-slate-700 text-sm">
                        {style.styleNo}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-semibold text-slate-800 text-sm">
                        {style.quantity} 件
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
