import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { apiGet, type AuthCredentials } from '@/api/client';
import { cacheGet, cacheKey, cacheSet } from '@/offline/cache';

export function useCachedQuery<T>(path: string | null, auth: AuthCredentials | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(Boolean(path));
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [cachedAt, setCachedAt] = useState<number | null>(null);
  const hasDataRef = useRef(false);

  const reload = useCallback(async () => {
    if (!path || !auth) return;
    const key = cacheKey(auth.organizationId, path);

    const cached = await cacheGet<T>(key);
    if (cached && !hasDataRef.current) {
      setData(cached.data);
      setFromCache(true);
      setCachedAt(cached.cachedAt);
      setLoading(false);
      hasDataRef.current = true;
    } else if (!hasDataRef.current) {
      setLoading(true);
    }

    try {
      const result = await apiGet<T>(path, auth);
      setData(result);
      setFromCache(false);
      setCachedAt(Date.now());
      setError(null);
      hasDataRef.current = true;
      await cacheSet(key, result);
    } catch (err) {
      if (!hasDataRef.current) {
        setError(err instanceof Error ? err.message : 'خطا');
      }
    } finally {
      setLoading(false);
    }
  }, [path, auth]);

  useEffect(() => {
    hasDataRef.current = false;
    setData(null);
    setFromCache(false);
    setError(null);
    void reload();
  }, [path, auth?.token, auth?.organizationId]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void reload();
    });
    return () => sub.remove();
  }, [reload]);

  return { data, loading, error, reload, fromCache, cachedAt };
}
