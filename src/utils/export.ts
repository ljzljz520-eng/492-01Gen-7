import * as XLSX from 'xlsx';
import type { SalarySummary, ProductionRecord, Subsidy, Worker } from '@/types';
import { PRODUCTION_TYPE_CONFIG, SUBSIDY_TYPE_CONFIG } from '@/constants';

interface ExportData {
  summaries: SalarySummary[];
  workers: Worker[];
  records: ProductionRecord[];
  subsidies: Subsidy[];
  year: number;
  month: number;
}

export function exportMonthlySalary(data: ExportData): void {
  const { summaries, records, subsidies, year, month } = data;

  const summaryData = summaries.map((s) => ({
    工号: s.workerNo,
    姓名: s.workerName,
    普通计件工资: Number(s.baseSalary.toFixed(2)),
    补贴合计: Number(s.subsidyTotal.toFixed(2)),
    总工资: Number(s.totalSalary.toFixed(2)),
  }));

  const detailData = records
    .filter((r) => {
      const date = new Date(r.date);
      return date.getFullYear() === year && date.getMonth() + 1 === month;
    })
    .map((r) => {
      const worker = data.workers.find((w) => w.id === r.workerId);
      const typeConfig = PRODUCTION_TYPE_CONFIG[r.productionType];
      return {
        日期: r.date,
        工号: worker?.workerNo || '',
        姓名: worker?.name || '',
        款号: r.styleId,
        工序ID: r.processId,
        数量: r.quantity,
        工价: r.unitPrice,
        产量类型: typeConfig?.label || r.productionType,
        工资金额: Number(r.amount.toFixed(2)),
        备注: r.remark || '',
      };
    });

  const subsidyData = subsidies
    .filter((s) => {
      const date = new Date(s.date);
      return date.getFullYear() === year && date.getMonth() + 1 === month;
    })
    .map((s) => {
      const worker = data.workers.find((w) => w.id === s.workerId);
      const typeConfig = SUBSIDY_TYPE_CONFIG[s.type];
      return {
        日期: s.date,
        工号: worker?.workerNo || '',
        姓名: worker?.name || '',
        补贴名称: s.name,
        补贴类型: typeConfig?.label || s.type,
        金额: Number(s.amount.toFixed(2)),
        备注: s.remark || '',
      };
    });

  const wb = XLSX.utils.book_new();

  const ws1 = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, ws1, '工资汇总表');

  const ws2 = XLSX.utils.json_to_sheet(detailData);
  XLSX.utils.book_append_sheet(wb, ws2, '计件明细表');

  const ws3 = XLSX.utils.json_to_sheet(subsidyData);
  XLSX.utils.book_append_sheet(wb, ws3, '补贴明细表');

  const colWidths = [
    { wch: 12 },
    { wch: 10 },
    { wch: 15 },
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
    { wch: 20 },
  ];
  ws1['!cols'] = colWidths.slice(0, 5);
  ws2['!cols'] = colWidths;
  ws3['!cols'] = colWidths.slice(0, 7);

  const fileName = `工资表_${year}年${String(month).padStart(2, '0')}月.xlsx`;
  XLSX.writeFile(wb, fileName);
}
