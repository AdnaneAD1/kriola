import { useState, useEffect } from 'react';
import axios from '@/lib/axios';

export function useAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get('/api/admin/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats
  };
}
