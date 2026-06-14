import { useState } from 'react';
import { Plus, Pencil, Trash2, Settings, Search, ChevronDown, ChevronUp } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useStyleStore } from '@/store/useStyleStore';
import { useProductionStore } from '@/store/useProductionStore';
import { formatMoney } from '@/utils/date';
import { calculateTotalQuantity, calculateTotalSalary } from '@/utils/salary';

export default function StyleManagement() {
  const {
    styles,
    processes,
    addStyle,
    updateStyle,
    deleteStyle,
    addProcess,
    updateProcess,
    deleteProcess,
    getProcessesByStyleId,
  } = useStyleStore();

  const records = useProductionStore((state) => state.records);

  const [searchText, setSearchText] = useState('');
  const [expandedStyleId, setExpandedStyleId] = useState<string | null>(null);
  const [styleModalOpen, setStyleModalOpen] = useState(false);
  const [processModalOpen, setProcessModalOpen] = useState(false);
  const [editingStyle, setEditingStyle] = useState<any>(null);
  const [editingProcess, setEditingProcess] = useState<any>(null);
  const [currentStyleId, setCurrentStyleId] = useState<string | null>(null);

  const [styleForm, setStyleForm] = useState({
    styleNo: '',
    styleName: '',
    description: '',
  });

  const [processForm, setProcessForm] = useState({
    processName: '',
    unitPrice: 0,
    sortOrder: 1,
  });

  const filteredStyles = styles.filter(
    (s) =>
      s.styleNo.toLowerCase().includes(searchText.toLowerCase()) ||
      s.styleName.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleAddStyle = () => {
    setEditingStyle(null);
    setStyleForm({ styleNo: '', styleName: '', description: '' });
    setStyleModalOpen(true);
  };

  const handleEditStyle = (style: any) => {
    setEditingStyle(style);
    setStyleForm({
      styleNo: style.styleNo,
      styleName: style.styleName,
      description: style.description || '',
    });
    setStyleModalOpen(true);
  };

  const handleSaveStyle = () => {
    if (editingStyle) {
      updateStyle(editingStyle.id, styleForm);
    } else {
      addStyle(styleForm);
    }
    setStyleModalOpen(false);
  };

  const handleDeleteStyle = (id: string) => {
    if (confirm('确定要删除该款号吗？相关工序也会被删除。')) {
      deleteStyle(id);
    }
  };

  const handleAddProcess = (styleId: string) => {
    setCurrentStyleId(styleId);
    setEditingProcess(null);
    const styleProcesses = getProcessesByStyleId(styleId);
    setProcessForm({
      processName: '',
      unitPrice: 0,
      sortOrder: styleProcesses.length + 1,
    });
    setProcessModalOpen(true);
  };

  const handleEditProcess = (process: any) => {
    setEditingProcess(process);
    setCurrentStyleId(process.styleId);
    setProcessForm({
      processName: process.processName,
      unitPrice: process.unitPrice,
      sortOrder: process.sortOrder,
    });
    setProcessModalOpen(true);
  };

  const handleSaveProcess = () => {
    if (currentStyleId) {
      if (editingProcess) {
        updateProcess(editingProcess.id, processForm);
      } else {
        addProcess({ ...processForm, styleId: currentStyleId });
      }
      setProcessModalOpen(false);
    }
  };

  const handleDeleteProcess = (id: string) => {
    if (confirm('确定要删除该工序吗？')) {
      deleteProcess(id);
    }
  };

  const getStyleStats = (styleId: string) => {
    const styleRecords = records.filter((r) => r.styleId === styleId);
    return {
      quantity: calculateTotalQuantity(styleRecords),
      amount: calculateTotalSalary(styleRecords),
    };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">款号管理</h1>
          <p className="text-slate-500 mt-1">管理款号、工序和工价</p>
        </div>
        <Button onClick={handleAddStyle}>
          <Plus className="w-4 h-4 mr-2" />
          新增款号
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="搜索款号或款式名称..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredStyles.map((style, index) => {
          const styleProcesses = getProcessesByStyleId(style.id);
          const stats = getStyleStats(style.id);
          const isExpanded = expandedStyleId === style.id;

          return (
            <div
              key={style.id}
              className="bg-white rounded-xl shadow-card overflow-hidden"
            >
              <div
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() =>
                  setExpandedStyleId(isExpanded ? null : style.id)
                }
              >
                <div className="flex items-center gap-4">
                  <span className="w-10 h-10 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 text-lg">
                        {style.styleNo}
                      </span>
                      <span className="text-slate-500">{style.styleName}</span>
                    </div>
                    {style.description && (
                      <p className="text-sm text-slate-400 mt-0.5">
                        {style.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-slate-500">累计产量</p>
                    <p className="font-mono font-semibold text-slate-800">
                      {stats.quantity} 件
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">累计工价</p>
                    <p className="font-mono font-semibold text-emerald-600">
                      {formatMoney(stats.amount)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditStyle(style);
                      }}
                      className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteStyle(style.id);
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-slate-100 p-5 bg-slate-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      工序列表
                    </h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddProcess(style.id);
                      }}
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      添加工序
                    </Button>
                  </div>

                  {styleProcesses.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      暂无工序，点击右上角添加
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      {styleProcesses.map((process) => (
                        <div
                          key={process.id}
                          className="bg-white rounded-lg p-4 border border-slate-100 hover:border-primary-200 transition-colors group"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-xs text-slate-400">
                                第 {process.sortOrder} 道
                              </span>
                              <p className="font-medium text-slate-800 mt-0.5">
                                {process.processName}
                              </p>
                              <p className="text-primary-600 font-mono font-semibold mt-2">
                                {formatMoney(process.unitPrice)}/件
                              </p>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEditProcess(process)}
                                className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteProcess(process.id)
                                }
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filteredStyles.length === 0 && (
          <div className="bg-white rounded-xl shadow-card p-12 text-center">
            <p className="text-slate-400">暂无款号数据</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={styleModalOpen}
        onClose={() => setStyleModalOpen(false)}
        title={editingStyle ? '编辑款号' : '新增款号'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              款号
            </label>
            <input
              type="text"
              value={styleForm.styleNo}
              onChange={(e) =>
                setStyleForm({ ...styleForm, styleNo: e.target.value })
              }
              placeholder="请输入款号"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              款式名称
            </label>
            <input
              type="text"
              value={styleForm.styleName}
              onChange={(e) =>
                setStyleForm({ ...styleForm, styleName: e.target.value })
              }
              placeholder="请输入款式名称"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              描述
            </label>
            <textarea
              value={styleForm.description}
              onChange={(e) =>
                setStyleForm({ ...styleForm, description: e.target.value })
              }
              placeholder="请输入描述（可选）"
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setStyleModalOpen(false)}>
            取消
          </Button>
          <Button onClick={handleSaveStyle}>保存</Button>
        </div>
      </Modal>

      <Modal
        isOpen={processModalOpen}
        onClose={() => setProcessModalOpen(false)}
        title={editingProcess ? '编辑工序' : '添加工序'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              工序名称
            </label>
            <input
              type="text"
              value={processForm.processName}
              onChange={(e) =>
                setProcessForm({ ...processForm, processName: e.target.value })
              }
              placeholder="如：裁剪、缝纫"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              工价（元/件）
            </label>
            <input
              type="number"
              step="0.01"
              value={processForm.unitPrice}
              onChange={(e) =>
                setProcessForm({
                  ...processForm,
                  unitPrice: Number(e.target.value),
                })
              }
              placeholder="请输入工价"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              排序
            </label>
            <input
              type="number"
              value={processForm.sortOrder}
              onChange={(e) =>
                setProcessForm({
                  ...processForm,
                  sortOrder: Number(e.target.value),
                })
              }
              placeholder="工序顺序"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setProcessModalOpen(false)}>
            取消
          </Button>
          <Button onClick={handleSaveProcess}>保存</Button>
        </div>
      </Modal>
    </div>
  );
}
