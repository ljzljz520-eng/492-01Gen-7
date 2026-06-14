import { useState, useMemo } from 'react';
import { Plus, Check, Search, ChevronRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useStyleStore } from '@/store/useStyleStore';
import { useWorkerStore } from '@/store/useWorkerStore';
import { useProductionStore } from '@/store/useProductionStore';
import { getToday, formatMoney } from '@/utils/date';
import { PRODUCTION_TYPE_CONFIG } from '@/constants';
import { calculateRecordAmount } from '@/utils/salary';
import type { ProductionType } from '@/types';

export default function ProductionEntry() {
  const { styles, processes, getProcessesByStyleId, getStyleById } = useStyleStore();
  const { getWorkersByRole, getWorkerById } = useWorkerStore();
  const { addRecord } = useProductionStore();

  const [step, setStep] = useState(1);
  const [selectedStyleId, setSelectedStyleId] = useState('');
  const [selectedProcessId, setSelectedProcessId] = useState('');
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>([]);
  const [quantity, setQuantity] = useState('');
  const [productionType, setProductionType] = useState<ProductionType>('normal');
  const [remark, setRemark] = useState('');
  const [workerSearch, setWorkerSearch] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const workers = getWorkersByRole('worker');
  const styleProcesses = selectedStyleId ? getProcessesByStyleId(selectedStyleId) : [];
  const selectedProcess = selectedProcessId
    ? processes.find((p) => p.id === selectedProcessId)
    : null;

  const filteredWorkers = useMemo(() => {
    if (!workerSearch.trim()) return workers;
    return workers.filter(
      (w) =>
        w.name.includes(workerSearch) ||
        w.workerNo.includes(workerSearch)
    );
  }, [workers, workerSearch]);

  const previewAmount = useMemo(() => {
    const qty = Number(quantity) || 0;
    const price = selectedProcess?.unitPrice || 0;
    return calculateRecordAmount(qty, price, productionType);
  }, [quantity, selectedProcess, productionType]);

  const totalWorkers = selectedWorkerIds.length;
  const totalAmount = previewAmount * totalWorkers;

  const handleStyleSelect = (styleId: string) => {
    setSelectedStyleId(styleId);
    setSelectedProcessId('');
    setStep(2);
  };

  const handleProcessSelect = (processId: string) => {
    setSelectedProcessId(processId);
    setStep(3);
  };

  const toggleWorker = (workerId: string) => {
    setSelectedWorkerIds((prev) =>
      prev.includes(workerId)
        ? prev.filter((id) => id !== workerId)
        : [...prev, workerId]
    );
  };

  const selectAllWorkers = () => {
    if (selectedWorkerIds.length === filteredWorkers.length) {
      setSelectedWorkerIds([]);
    } else {
      setSelectedWorkerIds(filteredWorkers.map((w) => w.id));
    }
  };

  const handleSubmit = () => {
    if (!selectedStyleId || !selectedProcessId || selectedWorkerIds.length === 0 || !quantity) {
      return;
    }

    const today = getToday();

    selectedWorkerIds.forEach((workerId) => {
      addRecord({
        workerId,
        processId: selectedProcessId,
        styleId: selectedStyleId,
        quantity: Number(quantity),
        productionType,
        unitPrice: selectedProcess?.unitPrice || 0,
        date: today,
        remark,
      });
    });

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setStep(1);
      setSelectedStyleId('');
      setSelectedProcessId('');
      setSelectedWorkerIds([]);
      setQuantity('');
      setProductionType('normal');
      setRemark('');
    }, 1500);
  };

  const selectedStyle = selectedStyleId ? getStyleById(selectedStyleId) : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">产量录入</h1>
        <p className="text-slate-500 mt-1">录入工人产量数据，系统自动计算工资</p>
      </div>

      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                step >= s
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              {step > s ? <Check className="w-5 h-5" /> : s}
            </div>
            {s < 4 && (
              <div
                className={`w-16 h-1 mx-2 rounded-full transition-colors ${
                  step > s ? 'bg-primary-600' : 'bg-slate-100'
                }`}
              ></div>
            )}
          </div>
        ))}
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 text-center animate-bounce-in shadow-2xl">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">录入成功</h3>
            <p className="text-slate-500">
              已为 {selectedWorkerIds.length} 位工人录入产量
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-card p-6 min-h-[400px]">
        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              选择款号
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {styles.map((style) => (
                <div
                  key={style.id}
                  onClick={() => handleStyleSelect(style.id)}
                  className="p-5 border-2 border-slate-100 rounded-xl cursor-pointer hover:border-primary-400 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-slate-800 text-lg">
                        {style.styleNo}
                      </p>
                      <p className="text-slate-500 mt-1">{style.styleName}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                  </div>
                  {style.description && (
                    <p className="text-sm text-slate-400 mt-3 truncate">
                      {style.description}
                    </p>
                  )}
                  <div className="mt-3 text-xs text-slate-400">
                    {getProcessesByStyleId(style.id).length} 道工序
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">
                选择工序
              </h2>
              <button
                onClick={() => setStep(1)}
                className="text-sm text-primary-600 hover:underline"
              >
                返回上一步
              </button>
            </div>
            <div className="mb-4 p-3 bg-primary-50 rounded-lg">
              <p className="text-sm text-primary-700">
                已选款号：<span className="font-medium">{selectedStyle?.styleNo} - {selectedStyle?.styleName}</span>
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {styleProcesses.map((process) => (
                <div
                  key={process.id}
                  onClick={() => handleProcessSelect(process.id)}
                  className="p-5 border-2 border-slate-100 rounded-xl cursor-pointer hover:border-primary-400 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs text-slate-400">
                        第 {process.sortOrder} 道
                      </span>
                      <p className="font-semibold text-slate-800 mt-0.5">
                        {process.processName}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-primary-600 font-mono font-bold mt-3">
                    {formatMoney(process.unitPrice)}/件
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">
                选择工人
              </h2>
              <button
                onClick={() => setStep(2)}
                className="text-sm text-primary-600 hover:underline"
              >
                返回上一步
              </button>
            </div>

            <div className="mb-4 p-3 bg-primary-50 rounded-lg">
              <p className="text-sm text-primary-700">
                已选：<span className="font-medium">{selectedStyle?.styleNo}</span> -{' '}
                <span className="font-medium">{selectedProcess?.processName}</span>
                <span className="ml-2">({formatMoney(selectedProcess?.unitPrice || 0)}/件)</span>
              </p>
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={workerSearch}
                  onChange={(e) => setWorkerSearch(e.target.value)}
                  placeholder="搜索工人姓名或工号..."
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={selectAllWorkers}
                className="text-sm text-primary-600 hover:underline ml-4"
              >
                {selectedWorkerIds.length === filteredWorkers.length
                  ? '取消全选'
                  : '全选'}
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="max-h-80 overflow-y-auto">
                {filteredWorkers.map((worker, index) => (
                  <div
                    key={worker.id}
                    onClick={() => toggleWorker(worker.id)}
                    className={`flex items-center justify-between px-4 py-3 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors ${
                      selectedWorkerIds.includes(worker.id)
                        ? 'bg-primary-50'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          selectedWorkerIds.includes(worker.id)
                            ? 'bg-primary-600 border-primary-600'
                            : 'border-slate-300'
                        }`}
                      >
                        {selectedWorkerIds.includes(worker.id) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-xs text-slate-500">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-slate-800">
                          {worker.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          工号：{worker.workerNo}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 text-sm text-slate-500">
              已选择 <span className="font-semibold text-primary-600">{selectedWorkerIds.length}</span> 位工人
            </div>

            {selectedWorkerIds.length > 0 && (
              <Button
                className="mt-4"
                onClick={() => setStep(4)}
                fullWidth
              >
                下一步：录入数量
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        )}

        {step === 4 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">
                录入产量
              </h2>
              <button
                onClick={() => setStep(3)}
                className="text-sm text-primary-600 hover:underline"
              >
                返回上一步
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">款号</p>
                  <p className="font-semibold text-slate-800">
                    {selectedStyle?.styleNo} - {selectedStyle?.styleName}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">工序</p>
                  <p className="font-semibold text-slate-800">
                    {selectedProcess?.processName} ({formatMoney(selectedProcess?.unitPrice || 0)}/件)
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">工人数量</p>
                  <p className="font-semibold text-slate-800">
                    {selectedWorkerIds.length} 人
                  </p>
                </div>
                <div className="p-4 bg-primary-50 rounded-xl">
                  <p className="text-sm text-primary-600 mb-1">预计总工资</p>
                  <p className="font-mono font-bold text-primary-700 text-xl">
                    {formatMoney(totalAmount)}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  完成数量（件）
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="请输入完成数量"
                  className="w-full px-4 py-3 text-xl font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  产量类型
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(PRODUCTION_TYPE_CONFIG).map(([type, config]) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setProductionType(type as ProductionType)}
                      className={`p-3 rounded-xl border-2 transition-all text-center ${
                        productionType === type
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${config.bgColor} ${config.color}`}
                      >
                        {config.label}
                      </span>
                      <p className="text-xs text-slate-500 mt-2">
                        按 {(config.ratio * 100).toFixed(0)}% 计薪
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  备注（可选）
                </label>
                <textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="输入备注信息..."
                  rows={2}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-sm text-amber-700">
                  <span className="font-medium">温馨提示：</span>
                  {productionType === 'normal'
                    ? '正常产量按 100% 计算工资'
                    : productionType === 'rework'
                    ? '返工产量不计入工资，仅记录数量'
                    : productionType === 'material_shortage'
                    ? '缺料产量按 50% 计算工资'
                    : '质检不过不计入工资，仅记录数量'}
                </p>
              </div>

              <Button size="lg" fullWidth onClick={handleSubmit}>
                <Plus className="w-5 h-5 mr-2" />
                确认录入
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
