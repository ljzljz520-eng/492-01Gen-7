import { PRODUCTION_TYPE_CONFIG } from '@/constants';
import type { ProductionRecord, SalarySummary, Worker, Subsidy } from '@/types';
import { isInMonth } from './date';

export function calculateRecordAmount(
  quantity: number,
  unitPrice: number,
  productionType: string
): number {
  const config = PRODUCTION_TYPE_CONFIG[productionType];
  const ratio = config ? config.ratio : 1;
  return Number((quantity * unitPrice * ratio).toFixed(2));
}

export function calculateTotalSalary(records: ProductionRecord[]): number {
  return records.reduce((sum, record) => sum + record.amount, 0);
}

export function calculateTotalQuantity(records: ProductionRecord[]): number {
  return records.reduce((sum, record) => sum + record.quantity, 0);
}

export function calculateNormalSalary(records: ProductionRecord[]): number {
  return records
    .filter((r) => r.productionType === 'normal')
    .reduce((sum, record) => sum + record.amount, 0);
}

export function getSalarySummary(
  worker: Worker,
  records: ProductionRecord[],
  subsidies: Subsidy[]
): SalarySummary {
  const workerRecords = records.filter((r) => r.workerId === worker.id);
  const workerSubsidies = subsidies.filter((s) => s.workerId === worker.id);

  const baseSalary = calculateTotalSalary(workerRecords);
  const subsidyTotal = workerSubsidies.reduce((sum, s) => sum + s.amount, 0);

  return {
    workerId: worker.id,
    workerName: worker.name,
    workerNo: worker.workerNo,
    baseSalary,
    subsidyTotal,
    totalSalary: Number((baseSalary + subsidyTotal).toFixed(2)),
    records: workerRecords,
    subsidies: workerSubsidies,
  };
}

export function getMonthSalarySummaries(
  workers: Worker[],
  records: ProductionRecord[],
  subsidies: Subsidy[],
  year: number,
  month: number
): SalarySummary[] {
  const monthRecords = records.filter((r) => isInMonth(r.date, year, month));
  const monthSubsidies = subsidies.filter((s) => isInMonth(s.date, year, month));

  return workers
    .filter((w) => w.role === 'worker')
    .map((worker) => getSalarySummary(worker, monthRecords, monthSubsidies))
    .sort((a, b) => b.totalSalary - a.totalSalary);
}

export function getProductionTypeStats(records: ProductionRecord[]) {
  const stats: Record<string, { quantity: number; amount: number }> = {
    normal: { quantity: 0, amount: 0 },
    rework: { quantity: 0, amount: 0 },
    material_shortage: { quantity: 0, amount: 0 },
    quality_fail: { quantity: 0, amount: 0 },
  };

  records.forEach((record) => {
    if (stats[record.productionType]) {
      stats[record.productionType].quantity += record.quantity;
      stats[record.productionType].amount += record.amount;
    }
  });

  return stats;
}
