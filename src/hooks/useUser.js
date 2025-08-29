import useSWR from 'swr'
import axios from '@/lib/axios'

export const useUser = (id) => {
    const { data: user, error, mutate } = useSWR(id ? `/api/users/${id}` : null, () =>
        axios
            .get(`/api/users/${id}`)
            .then(res => res.data)
            .catch(error => {
                throw error
            }),
    )

    return {
        user,
        error,
        loading: !user && !error,
        mutate,
    }
}
