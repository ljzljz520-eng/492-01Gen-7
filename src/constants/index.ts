import type { ProductionTypeConfig } from '@/types';

export const PRODUCTION_TYPE_CONFIG: Record<string, ProductionTypeConfig> = {
  normal: {
    label: '正常',
    labelEn: 'Normal',
    ratio: 1,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  rework: {
    label: '返工',
    labelEn: 'Rework',
    ratio: 0,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
  },
  material_shortage: {
    label: '缺料',
    labelEn: 'Material Shortage',
    ratio: 0.5,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  quality_fail: {
    label: '质检不过',
    labelEn: 'Quality Fail',
    ratio: 0,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
};

export const SUBSIDY_TYPE_CONFIG = {
  bonus: {
    label: '奖金',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  allowance: {
    label: '津贴',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  other: {
    label: '其他',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
  },
};

export const STORAGE_KEYS = {
  AUTH: 'garment_auth',
  STYLES: 'garment_styles',
  PROCESSES: 'garment_processes',
  WORKERS: 'garment_workers',
  RECORDS: 'garment_records',
  SUBSIDIES: 'garment_subsidies',
  INITIALIZED: 'garment_initialized',
};
