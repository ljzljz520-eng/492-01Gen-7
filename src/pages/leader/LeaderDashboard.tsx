import { useMemo } from 'react';
import {
  TrendingUp,
  Users,
  Package,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import StatCard from '@/components/ui/StatCard';
import { useProductionStore } from '@/store/useProductionStore';
import { useWorkerStore } from '@/store/useWorkerStore';
import { useStyleStore } from '@/store/useStyleStore';
import { getToday, formatMoney, formatDate } from '@/utils/date';
import {
  calculateTotalQuantity,
  calculateTotalSalary,
  getProductionTypeStats,
} from '@/utils/salary';
import { PRODUCTION_TYPE_CONFIG } from '@/constants';

export default function LeaderDashboard() {
  const today = getToday();
  const records = useProductionStore((state) => state.records);
  const workers = useWorkerStore((state) => state.workers);
  const styles = useStyleStore((state) => state.styles);

  const todayRecords = useMemo(
    () => records.filter((r) => r.date === today),
    [records, today]
  );

  const todayStats = useMemo(() => {
    const totalQuantity = calculateTotalQuantity(todayRecords);
    const totalSalary = calculateTotalSalary(todayRecords);
    const activeWorkers = new Set(todayRecords.map((r) => r.workerId)).size;
    const typeStats = getProductionTypeStats(todayRecords);
    const abnormalQuantity =
      typeStats.rework.quantity +
      typeStats.material_shortage.quantity +
      typeStats.quality_fail.quantity;

    return {
      totalQuantity,
      totalSalary,
      activeWorkers,
      abnormalQuantity,
      typeStats,
    };
  }, [todayRecords]);

  const last7DaysData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = formatDate(date);
      const dayRecords = records.filter((r) => r.date === dateStr);
      data.push({
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        正常: getProductionTypeStats(dayRecords).normal.quantity,
        异常:
          getProductionTypeStats(dayRecords).rework.quantity +
          getProductionTypeStats(dayRecords).material_shortage.quantity +
          getProductionTypeStats(dayRecords).quality_fail.quantity,
      });
    }
    return data;
  }, [records]);

  const styleProgress = useMemo(() => {
    return styles.map((style) => {
      const styleRecords = todayRecords.filter((r) => r.styleId === style.id);
      const quantity = calculateTotalQuantity(styleRecords);
      const amount = calculateTotalSalary(styleRecords);
      return {
        ...style,
        quantity,
        amount,
      };
    });
  }, [styles, todayRecords]);

  const workerRanking = useMemo(() => {
    const workerStats = workers
      .filter((w) => w.role === 'worker')
      .map((worker) => {
        const workerRecords = todayRecords.filter(
          (r) => r.workerId === worker.id
        );
        const salary = calculateTotalSalary(workerRecords);
        const quantity = calculateTotalQuantity(workerRecords);
        return {
          ...worker,
          salary,
          quantity,
        };
      })
      .sort((a, b) => b.salary - a.salary)
      .slice(0, 5);

    return workerStats;
  }, [workers, todayRecords]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">生产看板</h1>
          <p className="text-slate-500 mt-1">今日生产数据概览 - {today}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="今日总产量"
          value={todayStats.totalQuantity.toLocaleString()}
          subtitle="件"
          icon={<Package className="w-5 h-5" />}
          color="blue"
          trend="up"
          trendValue="12%"
        />
        <StatCard
          title="今日总工资"
          value={formatMoney(todayStats.totalSalary)}
          subtitle="元"
          icon={<DollarSign className="w-5 h-5" />}
          color="green"
          trend="up"
          trendValue="8%"
        />
        <StatCard
          title="在岗工人"
          value={`${todayStats.activeWorkers} 人`}
          subtitle={`共 ${workers.filter((w) => w.role === 'worker').length} 人`}
          icon={<Users className="w-5 h-5" />}
          color="orange"
        />
        <StatCard
          title="异常件数"
          value={todayStats.abnormalQuantity.toLocaleString()}
          subtitle="返工/缺料/质检不过"
          icon={<AlertTriangle className="w-5 h-5" />}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-card p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            近7天产量趋势
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7DaysData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar dataKey="正常" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="异常" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            产量类型分布
          </h2>
          <div className="space-y-4">
            {Object.entries(todayStats.typeStats).map(([type, stats]) => {
              const config = PRODUCTION_TYPE_CONFIG[type];
              const percentage =
                todayStats.totalQuantity > 0
                  ? ((stats.quantity / todayStats.totalQuantity) * 100).toFixed(1)
                  : '0';
              return (
                <div key={type}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          type === 'normal'
                            ? 'bg-emerald-500'
                            : type === 'rework'
                            ? 'bg-rose-500'
                            : type === 'material_shortage'
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}
                      ></span>
                      <span className="text-slate-600">{config.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-medium text-slate-800">
                        {stats.quantity}
                      </span>
                      <span className="text-slate-400 text-xs">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        type === 'normal'
                          ? 'bg-emerald-500'
                          : type === 'rework'
                          ? 'bg-rose-500'
                          : type === 'material_shortage'
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            款号进度（今日）
          </h2>
          <div className="space-y-3">
            {styleProgress.map((style, index) => (
              <div
                key={style.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-slate-800">
                      {style.styleNo}
                    </p>
                    <p className="text-sm text-slate-500">{style.styleName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-slate-800">
                    {style.quantity} 件
                  </p>
                  <p className="text-sm text-emerald-600">
                    {formatMoney(style.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            工人工资排行（今日）
          </h2>
          <div className="space-y-3">
            {workerRanking.map((worker, index) => (
              <div
                key={worker.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
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
                    <p className="font-medium text-slate-800">{worker.name}</p>
                    <p className="text-sm text-slate-500">
                      工号：{worker.workerNo}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-primary-600">
                    {formatMoney(worker.salary)}
                  </p>
                  <p className="text-sm text-slate-400">
                    {worker.quantity} 件
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
