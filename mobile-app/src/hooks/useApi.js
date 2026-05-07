import { useCallback, useState } from "react";

const useApi = (serviceCall) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        setError(null);
        return await serviceCall(...args);
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [serviceCall]
  );

  return { execute, loading, error };
};

export default useApi;
