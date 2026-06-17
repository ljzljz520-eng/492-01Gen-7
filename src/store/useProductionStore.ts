import { create } from 'zustand';
import type { ProductionRecord, Subsidy, BatchEntryRequest } from '@/types';
import { api } from '@/api/client';

interface ProductionState {
  records: ProductionRecord[];
  subsidies: Subsidy[];
  loading: boolean;
  error: string | null;
  setRecords: (records: ProductionRecord[]) => void;
  setSubsidies: (subsidies: Subsidy[]) => void;
  fetchRecords: (params?: {
    workerId?: string;
    date?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => Promise<ProductionRecord[]>;
  fetchSubsidies: (params?: {
    workerId?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => Promise<Subsidy[]>;
  batchCreateRecords: (payload: BatchEntryRequest) => Promise<ProductionRecord[]>;
  addRecord: (
    record: Omit<ProductionRecord, 'id' | 'amount' | 'createdAt'>
  ) => Promise<ProductionRecord>;
  updateRecord: (id: string, record: Partial<ProductionRecord>) => Promise<ProductionRecord>;
  deleteRecord: (id: string) => Promise<void>;
  getRecordsByDate: (date: string) => ProductionRecord[];
  getRecordsByWorker: (workerId: string) => ProductionRecord[];
  getRecordsByWorkerAndDate: (
    workerId: string,
    date: string
  ) => ProductionRecord[];
  getRecordsByStyle: (styleId: string) => ProductionRecord[];
  addSubsidy: (subsidy: Omit<Subsidy, 'id'>) => Promise<Subsidy>;
  updateSubsidy: (id: string, subsidy: Partial<Subsidy>) => Promise<Subsidy>;
  deleteSubsidy: (id: string) => Promise<void>;
  getSubsidiesByWorker: (workerId: string) => Subsidy[];
}

export const useProductionStore = create<ProductionState>()(
  (set, get) => ({
    records: [],
    subsidies: [],
    loading: false,
    error: null,

    setRecords: (records) => set({ records }),
    setSubsidies: (subsidies) => set({ subsidies }),

    fetchRecords: async (params) => {
      set({ loading: true, error: null });
      try {
        const records = await api.records.getAll(params);
        set({ records });
        return records;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch records';
        set({ error: errorMessage });
        throw err;
      } finally {
        set({ loading: false });
      }
    },

    fetchSubsidies: async (params) => {
      set({ loading: true, error: null });
      try {
        const subsidies = await api.subsidies.getAll(params);
        set({ subsidies });
        return subsidies;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch subsidies';
        set({ error: errorMessage });
        throw err;
      } finally {
        set({ loading: false });
      }
    },

    batchCreateRecords: async (payload) => {
      set({ loading: true, error: null });
      try {
        const newRecords = await api.records.batchCreate(payload);
        set((state) => ({
          records: [...state.records, ...newRecords],
        }));
        return newRecords;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to batch create records';
        set({ error: errorMessage });
        throw err;
      } finally {
        set({ loading: false });
      }
    },

    addRecord: async (record) => {
      set({ loading: true, error: null });
      try {
        const newRecord = await api.records.create(record);
        set((state) => ({
          records: [...state.records, newRecord],
        }));
        return newRecord;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to add record';
        set({ error: errorMessage });
        throw err;
      } finally {
        set({ loading: false });
      }
    },

    updateRecord: async (id, record) => {
      set({ loading: true, error: null });
      try {
        const updatedRecord = await api.records.update(id, record);
        set((state) => ({
          records: state.records.map((r) =>
            r.id === id ? { ...r, ...updatedRecord } : r
          ),
        }));
        return updatedRecord;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update record';
        set({ error: errorMessage });
        throw err;
      } finally {
        set({ loading: false });
      }
    },

    deleteRecord: async (id) => {
      set({ loading: true, error: null });
      try {
        await api.records.remove(id);
        set((state) => ({
          records: state.records.filter((r) => r.id !== id),
        }));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete record';
        set({ error: errorMessage });
        throw err;
      } finally {
        set({ loading: false });
      }
    },

    getRecordsByDate: (date) =>
      get().records.filter((r) => r.date === date),

    getRecordsByWorker: (workerId) =>
      get().records.filter((r) => r.workerId === workerId),

    getRecordsByWorkerAndDate: (workerId, date) =>
      get().records.filter((r) => r.workerId === workerId && r.date === date),

    getRecordsByStyle: (styleId) =>
      get().records.filter((r) => r.styleId === styleId),

    addSubsidy: async (subsidy) => {
      set({ loading: true, error: null });
      try {
        const newSubsidy = await api.subsidies.create(subsidy);
        set((state) => ({
          subsidies: [...state.subsidies, newSubsidy],
        }));
        return newSubsidy;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to add subsidy';
        set({ error: errorMessage });
        throw err;
      } finally {
        set({ loading: false });
      }
    },

    updateSubsidy: async (id, subsidy) => {
      set({ loading: true, error: null });
      try {
        const updatedSubsidy = await api.subsidies.update(id, subsidy);
        set((state) => ({
          subsidies: state.subsidies.map((s) =>
            s.id === id ? { ...s, ...updatedSubsidy } : s
          ),
        }));
        return updatedSubsidy;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update subsidy';
        set({ error: errorMessage });
        throw err;
      } finally {
        set({ loading: false });
      }
    },

    deleteSubsidy: async (id) => {
      set({ loading: true, error: null });
      try {
        await api.subsidies.remove(id);
        set((state) => ({
          subsidies: state.subsidies.filter((s) => s.id !== id),
        }));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete subsidy';
        set({ error: errorMessage });
        throw err;
      } finally {
        set({ loading: false });
      }
    },

    getSubsidiesByWorker: (workerId) =>
      get().subsidies.filter((s) => s.workerId === workerId),
  })
);
