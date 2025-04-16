'use client'

import { useState } from 'react';
import axios from '../lib/axios';

export const useDashboard = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const getStats = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get('/api/dashboard/stats');
            return response.data.stats;
        } catch (err) {
            setError(err.response?.data?.message || 'Une erreur est survenue');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const getSummary = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get('/api/dashboard/summary');
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || 'Une erreur est survenue');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        error,
        getStats,
        getSummary
    };
};
