import useSWR from 'swr';
import axios from '@/lib/axios';

export function useTreatments() {
    const { data: treatments, error, mutate } = useSWR('/api/treatments', () =>
        axios.get('/api/treatments').then(res => res.data)
    );

    const createTreatment = async (treatmentData) => {
        try {
            const response = await axios.post('/api/treatments', treatmentData);
            mutate();
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const updateTreatment = async (id, treatmentData) => {
        try {
            const response = await axios.put(`/api/treatments/${id}`, treatmentData);
            mutate();
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const deleteTreatment = async (id) => {
        try {
            await axios.delete(`/api/treatments/${id}`);
            mutate();
        } catch (error) {
            throw error;
        }
    };

    return {
        treatments,
        loading: !error && !treatments,
        error,
        createTreatment,
        updateTreatment,
        deleteTreatment
    };
}
