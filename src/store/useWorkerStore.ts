import { create } from 'zustand';
import type { Worker, UserRole } from '@/types';
import { api } from '@/api/client';

interface WorkerState {
  workers: Worker[];
  loading: boolean;
  error: string | null;
  setWorkers: (workers: Worker[]) => void;
  fetchWorkers: () => Promise<Worker[]>;
  addWorker: (worker: Omit<Worker, 'id' | 'createdAt'>) => Promise<Worker>;
  updateWorker: (id: string, worker: Partial<Worker>) => Promise<Worker>;
  deleteWorker: (id: string) => Promise<void>;
  getWorkerById: (id: string) => Worker | undefined;
  getWorkerByNo: (workerNo: string) => Worker | undefined;
  getWorkersByRole: (role: UserRole) => Worker[];
}

export const useWorkerStore = create<WorkerState>()(
  (set, get) => ({
    workers: [],
    loading: false,
    error: null,

    setWorkers: (workers) => set({ workers }),

    fetchWorkers: async () => {
      set({ loading: true, error: null });
      try {
        const workers = await api.workers.getAll();
        set({ workers });
        return workers;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch workers';
        set({ error: errorMessage });
        throw err;
      } finally {
        set({ loading: false });
      }
    },

    addWorker: async (worker) => {
      set({ loading: true, error: null });
      try {
        const newWorker = await api.workers.create(worker);
        set((state) => ({
          workers: [...state.workers, newWorker],
        }));
        return newWorker;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to add worker';
        set({ error: errorMessage });
        throw err;
      } finally {
        set({ loading: false });
      }
    },

    updateWorker: async (id, worker) => {
      set({ loading: true, error: null });
      try {
        const updatedWorker = await api.workers.update(id, worker);
        set((state) => ({
          workers: state.workers.map((w) =>
            w.id === id ? { ...w, ...updatedWorker } : w
          ),
        }));
        return updatedWorker;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update worker';
        set({ error: errorMessage });
        throw err;
      } finally {
        set({ loading: false });
      }
    },

    deleteWorker: async (id) => {
      set({ loading: true, error: null });
      try {
        await api.workers.remove(id);
        set((state) => ({
          workers: state.workers.filter((w) => w.id !== id),
        }));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete worker';
        set({ error: errorMessage });
        throw err;
      } finally {
        set({ loading: false });
      }
    },

    getWorkerById: (id) => get().workers.find((w) => w.id === id),

    getWorkerByNo: (workerNo) =>
      get().workers.find((w) => w.workerNo === workerNo),

    getWorkersByRole: (role) =>
      get().workers.filter((w) => w.role === role),
  })
);
