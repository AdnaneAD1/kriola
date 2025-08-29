import { useState } from 'react'
import { useUsers } from '@/hooks/useUsers'

export const useAdminSettings = () => {
    const { currentUser, updateUser, updatePasswordForCurrentUser } = useUsers()
    const [errors, setErrors] = useState([])
    const [status, setStatus] = useState(null)
    const [loading, setLoading] = useState(false)

    const user = currentUser

    // Keep signature stable: { name, email }
    // Email change is not handled here to avoid desync with Firebase Auth.
    const updateProfile = async ({ name, email }) => {
        setLoading(true)
        setErrors([])
        setStatus(null)

        try {
            if (!user?.id) throw new Error("Utilisateur courant introuvable")
            await updateUser({ id: user.id, name })
            setStatus('profile-updated')
        } catch (error) {
            const e = error?.message || 'Erreur lors de la mise à jour du profil'
            setErrors([{ message: e }])
        } finally {
            setLoading(false)
        }
    }

    // Keep signature stable
    const updatePassword = async ({ current_password, password, password_confirmation }) => {
        setLoading(true)
        setErrors([])
        setStatus(null)

        try {
            if (!password || password !== password_confirmation) {
                throw new Error('La confirmation du mot de passe ne correspond pas')
            }
            await updatePasswordForCurrentUser(current_password, password)
            setStatus('password-updated')
        } catch (error) {
            const e = error?.message || 'Erreur lors de la mise à jour du mot de passe'
            setErrors([{ message: e }])
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