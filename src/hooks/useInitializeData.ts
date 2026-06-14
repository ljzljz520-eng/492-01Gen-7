import { useEffect, useState } from 'react';
import { useStyleStore } from '@/store/useStyleStore';
import { useWorkerStore } from '@/store/useWorkerStore';
import { useProductionStore } from '@/store/useProductionStore';
import {
  generateMockStyles,
  generateMockProcesses,
  generateMockWorkers,
  generateMockRecords,
  generateMockSubsidies,
} from '@/utils/mockData';
import { getFromStorage, setToStorage } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants';

export function useInitializeData() {
  const [isInitialized, setIsInitialized] = useState(false);

  const setStyles = useStyleStore((state) => state.setStyles);
  const setProcesses = useStyleStore((state) => state.setProcesses);
  const setWorkers = useWorkerStore((state) => state.setWorkers);
  const setRecords = useProductionStore((state) => state.setRecords);
  const setSubsidies = useProductionStore((state) => state.setSubsidies);

  useEffect(() => {
    const initialized = getFromStorage(STORAGE_KEYS.INITIALIZED, false);

    if (!initialized) {
      const mockStyles = generateMockStyles();
      const mockProcesses = generateMockProcesses(mockStyles);
      const mockWorkers = generateMockWorkers();
      const mockRecords = generateMockRecords(mockStyles, mockProcesses, mockWorkers);
      const mockSubsidies = generateMockSubsidies(mockWorkers);

      setStyles(mockStyles);
      setProcesses(mockProcesses);
      setWorkers(mockWorkers);
      setRecords(mockRecords);
      setSubsidies(mockSubsidies);
      setToStorage(STORAGE_KEYS.INITIALIZED, true);
    }

    setIsInitialized(true);
  }, [setStyles, setProcesses, setWorkers, setRecords, setSubsidies]);

  return { isInitialized };
}
