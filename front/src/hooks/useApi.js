import { useEffect, useState, useCallback } from 'react';

export const useApi = (apiFn, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFn(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    let unmounted = false;
    execute().then((result) => {
      if (unmounted) return;
    });
    return () => {
      unmounted = true;
    };
  }, deps);

  return { data, loading, error, refetch: execute };
};
