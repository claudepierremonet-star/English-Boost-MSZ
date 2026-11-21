import { useState, useEffect, useCallback } from 'react';
import { syncManager, type SyncStatusState, type ManualSyncResult } from './syncManager';

export function useSyncStatus() {
  const [status, setStatus] = useState<SyncStatusState>(syncManager.getState());

  useEffect(() => {
    const unsubscribe = syncManager.subscribe((newStatus) => {
      setStatus(newStatus);
    });
    return unsubscribe;
  }, []);

  const triggerSync = useCallback(async () => {
    return await syncManager.syncPendingData();
  }, []);

  const syncNow = useCallback(async (): Promise<ManualSyncResult> => {
    return await syncManager.syncNow();
  }, []);

  const setAutoSyncEnabled = useCallback((enabled: boolean) => {
    syncManager.setAutoSyncEnabled(enabled);
  }, []);

  const refreshStats = useCallback(async () => {
    return await syncManager.refreshStats();
  }, []);

  return {
    ...status,
    triggerSync,
    syncNow,
    setAutoSyncEnabled,
    refreshStats
  };
}
