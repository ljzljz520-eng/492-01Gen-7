import { create } from 'zustand';
import type { Style, Process, StyleWithProcesses } from '@/types';
import { api } from '@/api/client';

interface StyleState {
  styles: Style[];
  processes: Process[];
  loading: boolean;
  error: string | null;
  setStyles: (styles: Style[]) => void;
  setProcesses: (processes: Process[]) => void;
  fetchStyles: () => Promise<StyleWithProcesses[]>;
  addStyle: (style: Omit<Style, 'id' | 'createdAt'>) => Promise<Style>;
  updateStyle: (id: string, style: Partial<Style>) => Promise<Style>;
  deleteStyle: (id: string) => Promise<void>;
  getStyleById: (id: string) => Style | undefined;
  addProcess: (process: Omit<Process, 'id'>) => Promise<Process>;
  updateProcess: (id: string, process: Partial<Process>) => Promise<Process>;
  deleteProcess: (id: string) => Promise<void>;
  getProcessesByStyleId: (styleId: string) => Process[];
  getProcessById: (id: string) => Process | undefined;
}

export const useStyleStore = create<StyleState>()(
  (set, get) => ({
    styles: [],
    processes: [],
    loading: false,
    error: null,

    setStyles: (styles) => set({ styles }),
    setProcesses: (processes) => set({ processes }),

    fetchStyles: async () => {
      set({ loading: true, error: null });
      try {
        const response = await api.styles.getAll();
        const stylesWithProcesses = response as unknown as StyleWithProcesses[];
        const allProcesses: Process[] = [];
        const styles: Style[] = stylesWithProcesses.map((item) => {
          const { processes, ...style } = item as StyleWithProcesses;
          if (processes) {
            allProcesses.push(...processes);
          }
          return style as Style;
        });
        set({ styles, processes: allProcesses });
        return stylesWithProcesses;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch styles';
        set({ error: errorMessage });
        throw err;
      } finally {
        set({ loading: false });
      }
    },

    addStyle: async (style) => {
      set({ loading: true, error: null });
      try {
        const newStyle = await api.styles.create(style);
        set((state) => ({
          styles: [...state.styles, newStyle],
        }));
        return newStyle;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to add style';
        set({ error: errorMessage });
        throw err;
      } finally {
        set({ loading: false });
      }
    },

    updateStyle: async (id, style) => {
      set({ loading: true, error: null });
      try {
        const updatedStyle = await api.styles.update(id, style);
        set((state) => ({
          styles: state.styles.map((s) =>
            s.id === id ? { ...s, ...updatedStyle } : s
          ),
        }));
        return updatedStyle;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update style';
        set({ error: errorMessage });
        throw err;
      } finally {
        set({ loading: false });
      }
    },

    deleteStyle: async (id) => {
      set({ loading: true, error: null });
      try {
        await api.styles.remove(id);
        set((state) => ({
          styles: state.styles.filter((s) => s.id !== id),
          processes: state.processes.filter((p) => p.styleId !== id),
        }));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete style';
        set({ error: errorMessage });
        throw err;
      } finally {
        set({ loading: false });
      }
    },

    getStyleById: (id) => get().styles.find((s) => s.id === id),

    addProcess: async (process) => {
      set({ loading: true, error: null });
      try {
        const newProcess = await api.processes.create(process);
        set((state) => ({
          processes: [...state.processes, newProcess],
        }));
        return newProcess;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to add process';
        set({ error: errorMessage });
        throw err;
      } finally {
        set({ loading: false });
      }
    },

    updateProcess: async (id, process) => {
      set({ loading: true, error: null });
      try {
        const updatedProcess = await api.processes.update(id, process);
        set((state) => ({
          processes: state.processes.map((p) =>
            p.id === id ? { ...p, ...updatedProcess } : p
          ),
        }));
        return updatedProcess;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update process';
        set({ error: errorMessage });
        throw err;
      } finally {
        set({ loading: false });
      }
    },

    deleteProcess: async (id) => {
      set({ loading: true, error: null });
      try {
        await api.processes.remove(id);
        set((state) => ({
          processes: state.processes.filter((p) => p.id !== id),
        }));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete process';
        set({ error: errorMessage });
        throw err;
      } finally {
        set({ loading: false });
      }
    },

    getProcessesByStyleId: (styleId) =>
      get()
        .processes.filter((p) => p.styleId === styleId)
        .sort((a, b) => a.sortOrder - b.sortOrder),

    getProcessById: (id) => get().processes.find((p) => p.id === id),
  })
);
