'use client'

import { useState } from 'react';
import axios from '../lib/axios';

export const useProfile = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const getProfile = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get('/api/profile');
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || 'Une erreur est survenue');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const updateProfile = async (data) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.put('/api/profile', data);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || 'Une erreur est survenue');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const updatePassword = async (data) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.put('/api/profile/password', data);
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
        getProfile,
        updateProfile,
        updatePassword
    };
};
