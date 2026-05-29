import { useState, useCallback } from 'react';

export function useAsync(asyncFn) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError('');
    try {
      const result = await asyncFn(...args);
      setData(result);
      return result;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [asyncFn]);

  return { data, error, loading, execute };
}
