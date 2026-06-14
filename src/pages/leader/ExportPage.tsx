import { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useProductionStore } from '@/store/useProductionStore';
import { useWorkerStore } from '@/store/useWorkerStore';
import { useStyleStore } from '@/store/useStyleStore';
import { formatMoney } from '@/utils/date';
import { getMonthSalarySummaries } from '@/utils/salary';
import { exportMonthlySalary } from '@/utils/export';
import { SUBSIDY_TYPE_CONFIG } from '@/constants';
import type { SubsidyType } from '@/types';

export default function ExportPage() {
  const currentDate = new Date();
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth() + 1);

  const { records, subsidies, addSubsidy, deleteSubsidy } = useProductionStore();
  const { workers, getWorkerById } = useWorkerStore();

  const [showSubsidyModal, setShowSubsidyModal] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const defaultDate = year + '-' + String(month).padStart(2, '0') + '-15';
  const [subsidyForm, setSubsidyForm] = useState({
    name: '',
    type: 'bonus' as SubsidyType,
    amount: 0,
    date: defaultDate,
    remark: '',
  });

  const summaries = useMemo(() => {
    return getMonthSalarySummaries(workers, records, subsidies, year, month);
  }, [workers, records, subsidies, year, month]);

  const monthSubsidies = useMemo(() => {
    return subsidies.filter((s) => {
      const date = new Date(s.date);
      return date.getFullYear() === year && date.getMonth() + 1 === month;
    });
  }, [subsidies, year, month]);

  const totalBaseSalary = summaries.reduce((sum, s) => sum + s.baseSalary, 0);
  const totalSubsidy = summaries.reduce((sum, s) => sum + s.subsidyTotal, 0);
  const totalSalary = summaries.reduce((sum, s) => sum + s.totalSalary, 0);

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const handleExport = () => {
    exportMonthlySalary({
      summaries,
      workers,
      records,
      subsidies,
      year,
      month,
    });
  };

  const handleAddSubsidy = () => {
    const dateStr = year + '-' + String(month).padStart(2, '0') + '-15';
    setSubsidyForm({
      name: '',
      type: 'bonus',
      amount: 0,
      date: dateStr,
      remark: '',
    });
    setSelectedWorkerId('');
    setShowSubsidyModal(true);
  };

  const handleSaveSubsidy = () => {
    if (!selectedWorkerId || !subsidyForm.name || !subsidyForm.amount) {
      return;
    }

    addSubsidy({
      ...subsidyForm,
      workerId: selectedWorkerId,
    });

    setShowSubsidyModal(false);
  };

  const handleDeleteSubsidy = (id: string) => {
    if (confirm('确定要删除该补贴吗？')) {
      deleteSubsidy(id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">月底结算</h1>
          <p className="text-slate-500 mt-1">按月生成工资明细并导出Excel</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleAddSubsidy}>
            <Plus className="w-4 h-4 mr-2" />
            添加补贴
          </Button>
          <Button onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            导出Excel
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between bg-white rounded-xl shadow-card p-5">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </button>

        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-primary-600" />
          <span className="text-xl font-bold text-slate-800">
            {year} 年 {month} 月
          </span>
        </div>

        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-slate-500">计件工资合计</span>
          </div>
          <p className="text-2xl font-bold text-blue-600 font-mono">
            {formatMoney(totalBaseSalary)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-sm text-slate-500">补贴合计</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600 font-mono">
            {formatMoney(totalSubsidy)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-primary-600" />
            </div>
            <span className="text-sm text-slate-500">总工资合计</span>
          </div>
          <p className="text-2xl font-bold text-primary-600 font-mono">
            {formatMoney(totalSalary)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">工资明细表</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                排名
              </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                工号
              </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                姓名
              </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  普通计件
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  补贴
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  总工资
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summaries.map((summary, index) => (
                <tr
                  key={summary.workerId}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`w-7 h-7 rounded-lg inline-flex items-center justify-center text-xs font-bold ${
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
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {summary.workerNo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                    {summary.workerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono text-slate-700">
                    {formatMoney(summary.baseSalary)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono text-emerald-600">
                    {formatMoney(summary.subsidyTotal)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono font-bold text-primary-600">
                    {formatMoney(summary.totalSalary)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {monthSubsidies.length > 0 && (
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">补贴明细</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    日期
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    姓名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    补贴名称
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    类型
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    金额
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {monthSubsidies.map((subsidy) => {
                  const worker = getWorkerById(subsidy.workerId || '');
                  const typeConfig = SUBSIDY_TYPE_CONFIG[subsidy.type];
                  return (
                    <tr
                      key={subsidy.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {subsidy.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                        {worker?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                        {subsidy.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${typeConfig.bgColor} ${typeConfig.color}`}
                        >
                          {typeConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono text-emerald-600">
                        {formatMoney(subsidy.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleDeleteSubsidy(subsidy.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={showSubsidyModal}
        onClose={() => setShowSubsidyModal(false)}
        title="添加补贴"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              选择工人
            </label>
            <select
              value={selectedWorkerId}
              onChange={(e) => setSelectedWorkerId(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">请选择工人</option>
              {workers
                .filter((w) => w.role === 'worker')
                .map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}（{w.workerNo}）
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              补贴名称
            </label>
            <input
              type="text"
              value={subsidyForm.name}
              onChange={(e) =>
                setSubsidyForm({ ...subsidyForm, name: e.target.value })
              }
              placeholder="如：全勤奖、伙食补贴"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                补贴类型
              </label>
              <select
                value={subsidyForm.type}
                onChange={(e) =>
                  setSubsidyForm({
                    ...subsidyForm,
                    type: e.target.value as SubsidyType,
                  })
                }
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="bonus">奖金</option>
                <option value="allowance">津贴</option>
                <option value="other">其他</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                金额（元）
              </label>
              <input
                type="number"
                value={subsidyForm.amount}
                onChange={(e) =>
                  setSubsidyForm({
                    ...subsidyForm,
                    amount: Number(e.target.value),
                  })
                }
                placeholder="0.00"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              日期
            </label>
            <input
              type="date"
              value={subsidyForm.date}
              onChange={(e) =>
                setSubsidyForm({ ...subsidyForm, date: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              备注
            </label>
            <textarea
              value={subsidyForm.remark}
              onChange={(e) =>
                setSubsidyForm({ ...subsidyForm, remark: e.target.value })
              }
              rows={2}
              placeholder="可选"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setShowSubsidyModal(false)}>
            取消
          </Button>
          <Button onClick={handleSaveSubsidy}>保存</Button>
        </div>
      </Modal>
    </div>
  );
}
