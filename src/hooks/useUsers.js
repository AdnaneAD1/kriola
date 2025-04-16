import useSWR from 'swr'
import axios from '@/lib/axios'

export const useUsers = () => {
    const { data: users, error, mutate } = useSWR('/api/users', () =>
        axios
            .get('/api/users')
            .then(res => res.data)
            .catch(error => {
                throw error
            }),
    )

    return {
        users,
        error,
        loading: !users && !error,
        mutate,
    }
}
