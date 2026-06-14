import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Style, Process } from '@/types';
import { generateId } from '@/utils/date';

interface StyleState {
  styles: Style[];
  processes: Process[];
  setStyles: (styles: Style[]) => void;
  setProcesses: (processes: Process[]) => void;
  addStyle: (style: Omit<Style, 'id' | 'createdAt'>) => void;
  updateStyle: (id: string, style: Partial<Style>) => void;
  deleteStyle: (id: string) => void;
  getStyleById: (id: string) => Style | undefined;
  addProcess: (process: Omit<Process, 'id'>) => void;
  updateProcess: (id: string, process: Partial<Process>) => void;
  deleteProcess: (id: string) => void;
  getProcessesByStyleId: (styleId: string) => Process[];
  getProcessById: (id: string) => Process | undefined;
}

export const useStyleStore = create<StyleState>()(
  persist(
    (set, get) => ({
      styles: [],
      processes: [],

      setStyles: (styles) => set({ styles }),
      setProcesses: (processes) => set({ processes }),

      addStyle: (style) =>
        set((state) => ({
          styles: [
            ...state.styles,
            {
              ...style,
              id: generateId(),
              createdAt: new Date().toISOString().split('T')[0],
            },
          ],
        })),

      updateStyle: (id, style) =>
        set((state) => ({
          styles: state.styles.map((s) =>
            s.id === id ? { ...s, ...style } : s
          ),
        })),

      deleteStyle: (id) =>
        set((state) => ({
          styles: state.styles.filter((s) => s.id !== id),
          processes: state.processes.filter((p) => p.styleId !== id),
        })),

      getStyleById: (id) => get().styles.find((s) => s.id === id),

      addProcess: (process) =>
        set((state) => ({
          processes: [...state.processes, { ...process, id: generateId() }],
        })),

      updateProcess: (id, process) =>
        set((state) => ({
          processes: state.processes.map((p) =>
            p.id === id ? { ...p, ...process } : p
          ),
        })),

      deleteProcess: (id) =>
        set((state) => ({
          processes: state.processes.filter((p) => p.id !== id),
        })),

      getProcessesByStyleId: (styleId) =>
        get()
          .processes.filter((p) => p.styleId === styleId)
          .sort((a, b) => a.sortOrder - b.sortOrder),

      getProcessById: (id) => get().processes.find((p) => p.id === id),
    }),
    {
      name: 'garment_styles',
    }
  )
);
