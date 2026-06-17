export type ProductionType = 'normal' | 'rework' | 'material_shortage' | 'quality_fail';

export type UserRole = 'leader' | 'worker';

export interface Style {
  id: string;
  styleNo: string;
  styleName: string;
  description?: string;
  createdAt: string;
}

export interface Process {
  id: string;
  styleId: string;
  processName: string;
  unitPrice: number;
  sortOrder: number;
  createdAt?: string;
}

export interface Worker {
  id: string;
  workerNo: string;
  name: string;
  role: UserRole;
  password: string;
  createdAt?: string;
}

export interface ProductionRecord {
  id: string;
  workerId: string;
  processId: string;
  styleId: string;
  quantity: number;
  productionType: ProductionType;
  unitPrice: number;
  amount: number;
  date: string;
  remark?: string;
  createdAt?: string;
}

export type SubsidyType = 'bonus' | 'allowance' | 'other';

export interface Subsidy {
  id: string;
  name: string;
  type: SubsidyType;
  amount: number;
  workerId?: string;
  date: string;
  remark?: string;
  createdAt?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginRequest {
  workerNo: string;
  password: string;
}

export interface LoginResponse {
  worker: Omit<Worker, 'password'>;
  token: string;
}

export interface BatchEntryItem {
  workerId: string;
  quantity: number;
  productionType: ProductionType;
}

export interface BatchEntryRequest {
  styleId: string;
  processId: string;
  date: string;
  items: BatchEntryItem[];
  remark?: string;
}
