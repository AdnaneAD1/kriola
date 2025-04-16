import { useState } from 'react'
import axios from '@/lib/axios'
import { useAuth } from '@/hooks/auth'

export const useAdminSettings = () => {
    const { user, setUser } = useAuth()
    const [errors, setErrors] = useState([])
    const [status, setStatus] = useState(null)
    const [loading, setLoading] = useState(false)

    const updateProfile = async ({ name, email }) => {
        setLoading(true)
        setErrors([])
        setStatus(null)

        try {
            const response = await axios.put('/api/admin/profile', {
                name,
                email,
            })
            setUser(response.data.user)
            setStatus('profile-updated')
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors)
            }
        } finally {
            setLoading(false)
        }
    }

    const updatePassword = async ({ current_password, password, password_confirmation }) => {
        setLoading(true)
        setErrors([])
        setStatus(null)

        try {
            await axios.put('/api/admin/password', {
                current_password,
                password,
                password_confirmation,
            })
            setStatus('password-updated')
        } catch (error) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors)
            }
        } finally {
            setLoading(false)
        }
    }

    return {
        user,
        errors,
        status,
        loading,
        updateProfile,
        updatePassword,
    }
}