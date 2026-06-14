import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Worker, UserRole } from '@/types';
import { generateId } from '@/utils/date';

interface WorkerState {
  workers: Worker[];
  setWorkers: (workers: Worker[]) => void;
  addWorker: (worker: Omit<Worker, 'id' | 'createdAt'>) => void;
  updateWorker: (id: string, worker: Partial<Worker>) => void;
  deleteWorker: (id: string) => void;
  getWorkerById: (id: string) => Worker | undefined;
  getWorkerByNo: (workerNo: string) => Worker | undefined;
  getWorkersByRole: (role: UserRole) => Worker[];
  login: (workerNo: string, password: string) => Worker | null;
}

export const useWorkerStore = create<WorkerState>()(
  persist(
    (set, get) => ({
      workers: [],

      setWorkers: (workers) => set({ workers }),

      addWorker: (worker) =>
        set((state) => ({
          workers: [
            ...state.workers,
            {
              ...worker,
              id: generateId(),
              createdAt: new Date().toISOString().split('T')[0],
            },
          ],
        })),

      updateWorker: (id, worker) =>
        set((state) => ({
          workers: state.workers.map((w) =>
            w.id === id ? { ...w, ...worker } : w
          ),
        })),

      deleteWorker: (id) =>
        set((state) => ({
          workers: state.workers.filter((w) => w.id !== id),
        })),

      getWorkerById: (id) => get().workers.find((w) => w.id === id),

      getWorkerByNo: (workerNo) =>
        get().workers.find((w) => w.workerNo === workerNo),

      getWorkersByRole: (role) =>
        get().workers.filter((w) => w.role === role),

      login: (workerNo, password) => {
        const worker = get().workers.find(
          (w) => w.workerNo === workerNo && w.password === password
        );
        return worker || null;
      },
    }),
    {
      name: 'garment_workers',
    }
  )
);
