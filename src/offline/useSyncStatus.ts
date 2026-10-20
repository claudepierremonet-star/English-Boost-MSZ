import { useState, useEffect } from 'react';
import { syncManager, type SyncStatusState } from './syncManager';

export function useSyncStatus() {
  const [status, setStatus] = useState<SyncStatusState>(syncManager.getState());

  useEffect(() => {
    const unsubscribe = syncManager.subscribe((newStatus) => {
      setStatus(newStatus);
    });
    return unsubscribe;
  }, []);

  const triggerSync = async () => {
    return await syncManager.syncPendingData();
  };

  const refreshStats = async () => {
    return await syncManager.refreshStats();
  };

  return {
    ...status,
    triggerSync,
    refreshStats
  };
}
