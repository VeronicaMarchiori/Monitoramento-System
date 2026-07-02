import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../utils/api';

interface OfflineAction {
  id: string;
  type: 'create' | 'update';
  entityType: string;
  data: any;
  timestamp: string;
}

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState<OfflineAction[]>([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    // Load pending actions from localStorage
    const stored = localStorage.getItem('offline_actions');
    if (stored) {
      setPendingActions(JSON.parse(stored));
    }

    const handleOnline = () => {
      setIsOnline(true);
      syncPendingActions();
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('offline_actions', JSON.stringify(pendingActions));
  }, [pendingActions]);

  const queueAction = useCallback((action: Omit<OfflineAction, 'id' | 'timestamp'>) => {
    const newAction: OfflineAction = {
      ...action,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };

    setPendingActions(prev => [...prev, newAction]);

    if (isOnline) {
      syncPendingActions();
    }
  }, [isOnline]);

  const syncPendingActions = async () => {
    if (pendingActions.length === 0 || syncing) return;

    setSyncing(true);
    try {
      const { results } = await apiClient.sync(pendingActions);
      
      // Remove successful actions
      const failedActions = pendingActions.filter((_, index) => !results[index]?.success);
      setPendingActions(failedActions);
    } catch (error) {
      console.error('Error syncing offline actions:', error);
    } finally {
      setSyncing(false);
    }
  };

  return {
    isOnline,
    pendingActions,
    syncing,
    queueAction,
    syncNow: syncPendingActions,
  };
}
