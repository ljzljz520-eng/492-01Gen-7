import type {
  ProductionType,
  UserRole,
  Style,
  Process,
  Worker,
  ProductionRecord,
  SubsidyType,
  Subsidy,
  ApiResponse,
  BatchEntryRequest,
  BatchEntryItem,
} from '../../shared/types';

export type {
  ProductionType,
  UserRole,
  Style,
  Process,
  Worker,
  ProductionRecord,
  SubsidyType,
  Subsidy,
  ApiResponse,
  BatchEntryRequest,
  BatchEntryItem,
};

export interface StyleWithProcesses extends Style {
  processes: Process[];
}

export interface SalarySummary {
  workerId: string;
  workerName: string;
  workerNo: string;
  baseSalary: number;
  subsidyTotal: number;
  totalSalary: number;
  records: ProductionRecord[];
  subsidies: Subsidy[];
}

export interface ProductionTypeConfig {
  label: string;
  labelEn: string;
  ratio: number;
  color: string;
  bgColor: string;
}
