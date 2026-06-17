import { useState, useMemo, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useProductionStore } from '@/store/useProductionStore';
import { useStyleStore } from '@/store/useStyleStore';
import { formatMoney, getCurrentMonth } from '@/utils/date';
import {
  calculateTotalQuantity,
  calculateTotalSalary,
} from '@/utils/salary';
import { PRODUCTION_TYPE_CONFIG } from '@/constants';

export default function WorkerHistory() {
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

  const { year: currentYear, month: currentMonth } = getCurrentMonth();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const monthRecords = useMemo(() => {
    if (!currentUser) return [];
    return records.filter((r) => {
      const d = new Date(r.date);
      return (
        r.workerId === currentUser.id &&
        d.getFullYear() === selectedYear &&
        d.getMonth() + 1 === selectedMonth
      );
    });
  }, [records, currentUser, selectedYear, selectedMonth]);

  const monthSubsidies = useMemo(() => {
    if (!currentUser) return [];
    return subsidies.filter((s) => {
      const d = new Date(s.date);
      return (
        s.workerId === currentUser.id &&
        d.getFullYear() === selectedYear &&
        d.getMonth() + 1 === selectedMonth
      );
    });
  }, [subsidies, currentUser, selectedYear, selectedMonth]);

  const monthStats = useMemo(() => {
    const salary = calculateTotalSalary(monthRecords);
    const quantity = calculateTotalQuantity(monthRecords);
    const subsidyTotal = monthSubsidies.reduce((sum, s) => sum + s.amount, 0);
    const uniqueDays = new Set(monthRecords.map((r) => r.date));
    return {
      salary,
      quantity,
      subsidyTotal,
      total: salary + subsidyTotal,
      days: uniqueDays.size,
    };
  }, [monthRecords, monthSubsidies]);

  const dailyRecords = useMemo(() => {
    const grouped: Record<string, typeof monthRecords> = {};
    monthRecords.forEach((record) => {
      if (!grouped[record.date]) {
        grouped[record.date] = [];
      }
      grouped[record.date].push(record);
    });

    return Object.entries(grouped)
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([date, records]) => ({
        date,
        records,
        quantity: calculateTotalQuantity(records),
        salary: calculateTotalSalary(records),
      }));
  }, [monthRecords]);

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
    setSelectedDate(null);
  };

  const selectedDaySubsidies = selectedDate
    ? monthSubsidies.filter((s) => s.date === selectedDate)
    : [];

  if (loading) {
    return (
      <div className="pb-4 animate-fade-in">
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-4 py-4">
            <h1 className="text-xl font-bold text-slate-800">历史记录</h1>
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="w-9 h-9 bg-slate-100 rounded-lg"></div>

            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-600" />
              <span className="text-lg font-semibold text-slate-800">
                {selectedYear}年{selectedMonth}月
              </span>
            </div>

            <div className="w-9 h-9 bg-slate-100 rounded-lg"></div>
          </div>

          <div className="grid grid-cols-3 gap-3 px-4 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <div className="h-3 w-16 bg-slate-200 rounded mx-auto mb-1 animate-pulse"></div>
                <div className="h-5 w-20 bg-slate-200 rounded mx-auto animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-4 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-slate-100 rounded-xl p-4 animate-pulse">
                <div className="h-4 w-20 bg-slate-200 rounded mb-2"></div>
                <div className="h-6 w-16 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-card overflow-hidden animate-pulse">
            <div className="px-4 py-3 border-b border-slate-100">
              <div className="h-5 w-20 bg-slate-200 rounded"></div>
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
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-slate-800">历史记录</h1>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>

          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-600" />
            <span className="text-lg font-semibold text-slate-800">
              {selectedYear}年{selectedMonth}月
            </span>
          </div>

          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 px-4 py-4">
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-1">计件工资</p>
            <p className="text-base font-bold text-slate-800 font-mono">
              {formatMoney(monthStats.salary)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-1">补贴</p>
            <p className="text-base font-bold text-emerald-600 font-mono">
              {formatMoney(monthStats.subsidyTotal)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-1">合计</p>
            <p className="text-base font-bold text-primary-600 font-mono">
              {formatMoney(monthStats.total)}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-700">总产量</span>
            </div>
            <p className="text-xl font-bold text-blue-700 font-mono">
              {monthStats.quantity}
              <span className="text-sm font-normal ml-1">件</span>
            </p>
          </div>
          <div className="bg-orange-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-orange-600" />
              <span className="text-sm text-orange-700">出勤天数</span>
            </div>
            <p className="text-xl font-bold text-orange-700 font-mono">
              {monthStats.days}
              <span className="text-sm font-normal ml-1">天</span>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">每日明细</h2>
          </div>

          {dailyRecords.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>本月暂无记录</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {dailyRecords.map((day) => (
                <div
                  key={day.date}
                  onClick={() =>
                    setSelectedDate(selectedDate === day.date ? null : day.date)
                  }
                  className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                        <span className="text-lg font-bold text-primary-600">
                          {new Date(day.date).getDate()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">
                          {day.date}
                        </p>
                        <p className="text-xs text-slate-400">
                          {day.quantity} 件
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-semibold text-primary-600">
                        {formatMoney(day.salary)}
                      </p>
                      <p className="text-xs text-slate-400">
                        点击查看详情
                      </p>
                    </div>
                  </div>

                  {selectedDate === day.date && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                      {day.records.map((record) => {
                        const style = getStyleById(record.styleId);
                        const process = getProcessById(record.processId);
                        const typeConfig =
                          PRODUCTION_TYPE_CONFIG[record.productionType];
                        return (
                          <div
                            key={record.id}
                            className="flex items-center justify-between py-2"
                          >
                            <div>
                              <p className="text-sm text-slate-700">
                                {style?.styleNo} - {process?.processName}
                              </p>
                              <span
                                className={`inline-block mt-1 px-2 py-0.5 text-xs rounded ${typeConfig.bgColor} ${typeConfig.color}`}
                              >
                                {typeConfig.label}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="font-mono text-sm font-medium text-slate-700">
                                {record.quantity} 件
                              </p>
                              <p className="text-xs text-slate-400">
                                {formatMoney(record.amount)}
                              </p>
                            </div>
                          </div>
                        );
                      })}

                      {selectedDaySubsidies.length > 0 && (
                        <div className="pt-3 border-t border-slate-100">
                          <p className="text-sm text-slate-500 mb-2">补贴</p>
                          {selectedDaySubsidies.map((subsidy) => (
                            <div
                              key={subsidy.id}
                              className="flex items-center justify-between py-2"
                            >
                              <span className="text-sm text-emerald-600">
                                {subsidy.name}
                              </span>
                              <span className="font-mono text-sm font-medium text-emerald-600">
                                +{formatMoney(subsidy.amount)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
