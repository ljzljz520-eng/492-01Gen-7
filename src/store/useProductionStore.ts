import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProductionRecord, Subsidy, ProductionType } from '@/types';
import { generateId } from '@/utils/date';
import { calculateRecordAmount } from '@/utils/salary';

interface ProductionState {
  records: ProductionRecord[];
  subsidies: Subsidy[];
  setRecords: (records: ProductionRecord[]) => void;
  setSubsidies: (subsidies: Subsidy[]) => void;
  addRecord: (
    record: Omit<ProductionRecord, 'id' | 'amount' | 'createdAt'>
  ) => void;
  updateRecord: (id: string, record: Partial<ProductionRecord>) => void;
  deleteRecord: (id: string) => void;
  getRecordsByDate: (date: string) => ProductionRecord[];
  getRecordsByWorker: (workerId: string) => ProductionRecord[];
  getRecordsByWorkerAndDate: (
    workerId: string,
    date: string
  ) => ProductionRecord[];
  getRecordsByStyle: (styleId: string) => ProductionRecord[];
  addSubsidy: (subsidy: Omit<Subsidy, 'id'>) => void;
  updateSubsidy: (id: string, subsidy: Partial<Subsidy>) => void;
  deleteSubsidy: (id: string) => void;
  getSubsidiesByWorker: (workerId: string) => Subsidy[];
}

export const useProductionStore = create<ProductionState>()(
  persist(
    (set, get) => ({
      records: [],
      subsidies: [],

      setRecords: (records) => set({ records }),
      setSubsidies: (subsidies) => set({ subsidies }),

      addRecord: (record) => {
        const amount = calculateRecordAmount(
          record.quantity,
          record.unitPrice,
          record.productionType
        );
        set((state) => ({
          records: [
            ...state.records,
            {
              ...record,
              id: generateId(),
              amount,
              createdAt: new Date().toISOString(),
            },
          ],
        }));
      },

      updateRecord: (id, record) =>
        set((state) => {
          const existing = state.records.find((r) => r.id === id);
          if (!existing) return state;

          const updated = { ...existing, ...record };
          const amount = calculateRecordAmount(
            updated.quantity,
            updated.unitPrice,
            updated.productionType as ProductionType
          );

          return {
            records: state.records.map((r) =>
              r.id === id ? { ...updated, amount } : r
            ),
          };
        }),

      deleteRecord: (id) =>
        set((state) => ({
          records: state.records.filter((r) => r.id !== id),
        })),

      getRecordsByDate: (date) =>
        get().records.filter((r) => r.date === date),

      getRecordsByWorker: (workerId) =>
        get().records.filter((r) => r.workerId === workerId),

      getRecordsByWorkerAndDate: (workerId, date) =>
        get().records.filter((r) => r.workerId === workerId && r.date === date),

      getRecordsByStyle: (styleId) =>
        get().records.filter((r) => r.styleId === styleId),

      addSubsidy: (subsidy) =>
        set((state) => ({
          subsidies: [
            ...state.subsidies,
            { ...subsidy, id: generateId() },
          ],
        })),

      updateSubsidy: (id, subsidy) =>
        set((state) => ({
          subsidies: state.subsidies.map((s) =>
            s.id === id ? { ...s, ...subsidy } : s
          ),
        })),

      deleteSubsidy: (id) =>
        set((state) => ({
          subsidies: state.subsidies.filter((s) => s.id !== id),
        })),

      getSubsidiesByWorker: (workerId) =>
        get().subsidies.filter((s) => s.workerId === workerId),
    }),
    {
      name: 'garment_production',
    }
  )
);
