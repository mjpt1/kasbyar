import { useCallback, useEffect, useState } from 'react';

import { apiGet, type AuthCredentials } from '@/api/client';

export function useApiQuery<T>(path: string | null, auth: AuthCredentials | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(Boolean(path));
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!path || !auth) return;
    setLoading(true);
    setError(null);
    try {
      const result = await apiGet<T>(path, auth);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا');
    } finally {
      setLoading(false);
    }
  }, [path, auth]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, error, reload };
}
