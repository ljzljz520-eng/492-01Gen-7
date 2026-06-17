import { useEffect, useState } from 'react';
import { useStyleStore } from '@/store/useStyleStore';
import { useWorkerStore } from '@/store/useWorkerStore';
import { useProductionStore } from '@/store/useProductionStore';

export function useInitializeData() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStyles = useStyleStore((state) => state.fetchStyles);
  const fetchWorkers = useWorkerStore((state) => state.fetchWorkers);
  const fetchRecords = useProductionStore((state) => state.fetchRecords);
  const fetchSubsidies = useProductionStore((state) => state.fetchSubsidies);

  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          fetchStyles(),
          fetchWorkers(),
          fetchRecords(),
          fetchSubsidies(),
        ]);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [fetchStyles, fetchWorkers, fetchRecords, fetchSubsidies]);

  return { isInitialized, isLoading };
}
