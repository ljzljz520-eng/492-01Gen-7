import { useMemo, useEffect } from 'react';
import { Wallet, Package, TrendingUp, Clock } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useProductionStore } from '@/store/useProductionStore';
import { useStyleStore } from '@/store/useStyleStore';
import { getToday, formatMoney } from '@/utils/date';
import {
  calculateTotalQuantity,
  calculateTotalSalary,
  getProductionTypeStats,
} from '@/utils/salary';
import { PRODUCTION_TYPE_CONFIG } from '@/constants';

export default function WorkerHome() {
  const { currentUser } = useAuthStore();
  const { records, subsidies, loading: productionLoading, fetchRecords, fetchSubsidies } = useProductionStore();
  const { loading: stylesLoading, fetchStyles, getStyleById, getProcessById } = useStyleStore();

  const loading = productionLoading || stylesLoading;

  useEffect(() => {
    if (currentUser?.id) {
      fetchStyles();
      fetchRecords({ workerId: currentUser.id });
      fetchSubsidies({ workerId: currentUser.id });
    }
  }, [fetchStyles, fetchRecords, fetchSubsidies, currentUser?.id]);

  const today = getToday();

  const todayRecords = useMemo(() => {
    if (!currentUser) return [];
    return records.filter(
      (r) => r.workerId === currentUser.id && r.date === today
    );
  }, [records, currentUser, today]);

  const todayStats = useMemo(() => {
    const quantity = calculateTotalQuantity(todayRecords);
    const salary = calculateTotalSalary(todayRecords);
    const typeStats = getProductionTypeStats(todayRecords);
    return { quantity, salary, typeStats };
  }, [todayRecords]);

  const monthStats = useMemo(() => {
    if (!currentUser) return { salary: 0, days: 0 };
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const monthRecords = records.filter((r) => {
      const d = new Date(r.date);
      return (
        r.workerId === currentUser.id &&
        d.getFullYear() === year &&
        d.getMonth() === month
      );
    });

    const uniqueDays = new Set(monthRecords.map((r) => r.date));
    return {
      salary: calculateTotalSalary(monthRecords),
      days: uniqueDays.size,
    };
  }, [records, currentUser]);

  const todaySubsidies = useMemo(() => {
    if (!currentUser) return [];
    return subsidies.filter(
      (s) => s.workerId === currentUser.id && s.date === today
    );
  }, [subsidies, currentUser, today]);

  const groupedRecords = useMemo(() => {
    const grouped: Record<string, typeof todayRecords> = {};
    todayRecords.forEach((record) => {
      const key = `${record.styleId}-${record.processId}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(record);
    });
    return grouped;
  }, [todayRecords]);

  if (loading) {
    return (
      <div className="pb-4 animate-fade-in">
        <div className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 pt-12 pb-20 px-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-primary-200 text-sm">你好，</p>
                <div className="h-7 w-24 bg-white/20 rounded animate-pulse mt-1"></div>
              </div>
              <div className="text-right">
                <p className="text-primary-200 text-sm">{today}</p>
                <p className="text-white text-sm">今日工资预估</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-5 h-5 text-accent-300" />
                <span className="text-primary-100 text-sm">今日预估收入</span>
              </div>
              <div className="h-12 w-32 bg-white/20 rounded animate-pulse"></div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/20">
                <div>
                  <p className="text-primary-200 text-xs">本月累计</p>
                  <div className="h-5 w-20 bg-white/20 rounded animate-pulse mt-1"></div>
                </div>
                <div className="text-right">
                  <p className="text-primary-200 text-xs">出勤天数</p>
                  <div className="h-5 w-12 bg-white/20 rounded animate-pulse mt-1"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 -mt-10 relative z-10 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-card text-center animate-pulse">
                <div className="w-10 h-10 bg-slate-200 rounded-xl mx-auto mb-2"></div>
                <div className="h-6 w-12 bg-slate-200 rounded mx-auto mb-1"></div>
                <div className="h-3 w-16 bg-slate-200 rounded mx-auto"></div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-card overflow-hidden animate-pulse">
            <div className="px-4 py-3 border-b border-slate-100">
              <div className="h-5 w-24 bg-slate-200 rounded"></div>
            </div>
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                  <div className="h-2 bg-slate-100 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-card overflow-hidden animate-pulse">
            <div className="px-4 py-3 border-b border-slate-100">
              <div className="h-5 w-24 bg-slate-200 rounded"></div>
            </div>
            <div className="p-8">
              <div className="w-12 h-12 bg-slate-200 rounded mx-auto mb-2 opacity-30"></div>
              <div className="h-4 w-32 bg-slate-200 rounded mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-4 animate-fade-in">
      <div className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 pt-12 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-primary-200 text-sm">你好，</p>
              <h1 className="text-2xl font-bold text-white">
                {currentUser?.name}
              </h1>
            </div>
            <div className="text-right">
              <p className="text-primary-200 text-sm">{today}</p>
              <p className="text-white text-sm">今日工资预估</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5 text-accent-300" />
              <span className="text-primary-100 text-sm">今日预估收入</span>
            </div>
            <p className="text-4xl font-bold text-white font-mono animate-number-roll">
              {formatMoney(todayStats.salary)}
            </p>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/20">
              <div>
                <p className="text-primary-200 text-xs">本月累计</p>
                <p className="text-white font-mono font-semibold">
                  {formatMoney(monthStats.salary)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-primary-200 text-xs">出勤天数</p>
                <p className="text-white font-mono font-semibold">
                  {monthStats.days} 天
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-10 relative z-10 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-card text-center">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-xl font-bold text-slate-800 font-mono">
              {todayStats.quantity}
            </p>
            <p className="text-xs text-slate-500">今日件数</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-card text-center">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-xl font-bold text-emerald-600 font-mono">
              {todayStats.typeStats.normal.quantity}
            </p>
            <p className="text-xs text-slate-500">正常产量</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-card text-center">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-xl font-bold text-slate-800 font-mono">
              {Object.keys(groupedRecords).length}
            </p>
            <p className="text-xs text-slate-500">工序数</p>
          </div>
        </div>

        {todaySubsidies.length > 0 && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
            <p className="text-sm font-medium text-emerald-700 mb-2">
              🎉 今日补贴
            </p>
            {todaySubsidies.map((subsidy) => (
              <div
                key={subsidy.id}
                className="flex items-center justify-between py-1"
              >
                <span className="text-sm text-emerald-600">
                  {subsidy.name}
                </span>
                <span className="font-mono font-semibold text-emerald-700">
                  +{formatMoney(subsidy.amount)}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">产量类型分布</h2>
          </div>
          <div className="p-4 space-y-3">
            {Object.entries(todayStats.typeStats).map(([type, stats]) => {
              const config = PRODUCTION_TYPE_CONFIG[type];
              const percentage =
                todayStats.quantity > 0
                  ? (stats.quantity / todayStats.quantity) * 100
                  : 0;
              return (
                <div key={type}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
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
                        {stats.quantity} 件
                      </span>
                      <span className="text-xs text-slate-400 w-10 text-right">
                        {percentage.toFixed(0)}%
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

        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">今日产量明细</h2>
          </div>
          {todayRecords.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>今日暂无产量记录</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {Object.entries(groupedRecords).map(([key, items]) => {
                const [styleId, processId] = key.split('-');
                const style = getStyleById(styleId);
                const process = getProcessById(processId);
                const totalQty = items.reduce((sum, r) => sum + r.quantity, 0);
                const totalAmount = items.reduce(
                  (sum, r) => sum + r.amount,
                  0
                );

                return (
                  <div key={key} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-slate-800">
                          {style?.styleNo} - {process?.processName}
                        </p>
                        <p className="text-xs text-slate-400">
                          工价 {formatMoney(process?.unitPrice || 0)}/件
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-semibold text-primary-600">
                          {formatMoney(totalAmount)}
                        </p>
                        <p className="text-xs text-slate-400">
                          {totalQty} 件
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {items.map((record) => {
                        const typeConfig =
                          PRODUCTION_TYPE_CONFIG[record.productionType];
                        return (
                          <span
                            key={record.id}
                            className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${typeConfig.bgColor} ${typeConfig.color}`}
                          >
                            {typeConfig.label} {record.quantity}件
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
