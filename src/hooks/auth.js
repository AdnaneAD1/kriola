import useSWR from 'swr'
import axios from '@/lib/axios'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export const useAuth = ({ middleware, redirectIfAuthenticated } = {}) => {
    const router = useRouter()

    const { data: user, error, mutate } = useSWR('/api/user', () =>
        axios
            .get('/api/user')
            .then(res => res.data)
            .catch(error => {
                if (error.response.status !== 409) throw error

                router.push('/verify-email')
            }),
    )

    const csrf = () => axios.get('/sanctum/csrf-cookie')

    const register = async ({ setErrors, ...props }) => {
        try {
            console.log('Starting registration process...');
            console.log('Registration data:', props);

            await csrf();
            console.log('CSRF token obtained');

            setErrors([]);

            const response = await axios.post('/register', props);
            console.log('Registration response:', response.data);

            await mutate();
            return response.data;
        } catch (error) {
            console.error('Registration error:', error.response || error);

            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                setErrors({
                    general: ['Une erreur est survenue lors de l\'inscription. Veuillez réessayer.']
                });
            }

            throw error;
        }
    }

    const login = async ({ setErrors, setStatus, ...props }) => {
        await csrf()

        setErrors([])
        setStatus(null)

        axios
            .post('/login', props)
            .then(() => mutate())
            .catch(error => {
                if (error.response.status !== 422) throw error

                setErrors(error.response.data.errors)
            })
    }

    const googleLogin = async () => {
        try {
            const { data } = await axios.get('/api/auth/google/redirect')
            window.location.href = data.url
        } catch (error) {
            console.error('Erreur lors de la redirection vers Google:', error)
        }
    }

    const handleGoogleCallback = async (code) => {
        try {
            const { data } = await axios.post('/api/auth/google/callback', { code })
            if (data.token) {
                localStorage.setItem('token', data.token)
                await mutate()
                return true
            }
            return false
        } catch (error) {
            console.error('Erreur lors de la connexion avec Google:', error)
            return false
        }
    }

    const forgotPassword = async ({ setErrors, setStatus, email }) => {
        await csrf()

        setErrors([])
        setStatus(null)

        axios
            .post('/forgot-password', { email })
            .then(response => setStatus(response.data.status))
            .catch(error => {
                if (error.response.status !== 422) throw error

                setErrors(error.response.data.errors)
            })
    }

    const resetPassword = async ({ setErrors, setStatus, ...props }) => {
        await csrf()

        setErrors([])
        setStatus(null)

        axios
            .post('/reset-password', { token: router.query.token, ...props })
            .then(response =>
                router.push('/login?reset=' + btoa(response.data.status)),
            )
            .catch(error => {
                if (error.response.status !== 422) throw error

                setErrors(error.response.data.errors)
            })
    }

    const resendEmailVerification = ({ setStatus }) => {
        axios
            .post('/email/verification-notification')
            .then(response => setStatus(response.data.status))
    }

    const logout = async () => {
        if (!error) {
            await axios.post('/logout')
            localStorage.removeItem('token')
            mutate()
        }

        window.location.pathname = '/login'
    }

    useEffect(() => {
        if (middleware === 'guest' && redirectIfAuthenticated && user)
            router.push(redirectIfAuthenticated)
        if (middleware === 'auth' && (user && !user.email_verified_at))
            router.push('/verify-email')
        if (
            window.location.pathname === '/verify-email' &&
            user?.email_verified_at
        )
            router.push(redirectIfAuthenticated)
        if (middleware === 'auth' && error) logout()
    }, [user, error])

    return {
        user,
        register,
        login,
        googleLogin,
        handleGoogleCallback,
        forgotPassword,
        resetPassword,
        resendEmailVerification,
        logout,
    }
}
