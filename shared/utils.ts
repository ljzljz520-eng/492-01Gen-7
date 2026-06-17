import type { ProductionType } from './types.js';
import { PRODUCTION_TYPE_CONFIG } from '../src/constants/index.js';

export function calculateRecordAmount(
  quantity: number,
  unitPrice: number,
  productionType: ProductionType
): number {
  const config = PRODUCTION_TYPE_CONFIG[productionType];
  const ratio = config ? config.ratio : 1;
  return Number((quantity * unitPrice * ratio).toFixed(2));
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
