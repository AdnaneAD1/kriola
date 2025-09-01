'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { Mail, Lock } from 'lucide-react'
import { AuthLogo } from '../../../components/ui/AuthLogo'
// import { useAuth, isIOS } from '@/hooks/auth'
import AuthSessionStatus from '@/app/(auth)/AuthSessionStatus'
import { LoadingButton } from '@/components/ui/LoadingButton'
import { useRouter } from 'next/navigation'
import { useUsers } from '@/hooks/useUsers'

export default function Login() {
  const router = useRouter()
  const { signIn, currentUser } = useUsers()
  const submittingRef = useRef(false)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [errors, setErrors] = useState([])
  const [status, setStatus] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  // const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  useEffect(() => {
    const user = currentUser
    if (user) {
      if (user.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/dashboard';
      }
    }
  }, [currentUser])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submittingRef.current) return
    submittingRef.current = true
    setIsLoading(true)
    try {
      setErrors({})
      setStatus(null)
      await signIn(formData.email, formData.password)
      // Redirection gérée par useEffect selon le rôle
      console.log('Connexion réussie')
    } catch (error) {
      const code = error?.code
      let message = 'Erreur de connexion.'
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
        message = 'Identifiants invalides. Vérifiez votre email et votre mot de passe.'
      } else if (code === 'auth/user-not-found') {
        message = "Aucun compte trouvé pour cet email."
      } else if (code === 'auth/too-many-requests') {
        message = 'Trop de tentatives. Veuillez réessayer plus tard.'
      } else if (code === 'auth/network-request-failed') {
        message = 'Problème réseau. Vérifiez votre connexion et réessayez.'
      }
      setStatus(message)
    } finally {
      setIsLoading(false)
      submittingRef.current = false
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/" className="inline-block">
            <AuthLogo />
          </Link>
        </div>

        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Connexion à votre compte
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ou{' '}
          <Link href="/register" className="text-primary hover:text-primary/80">
            créer un nouveau compte
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm rounded-lg sm:px-10">
          <AuthSessionStatus className="mb-4" status={status} />

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adresse email
              </label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input pl-10 w-full"
                />
              </div>
              {errors.email && (
                <div className="mt-1 text-sm text-red-600">{errors.email[0]}</div>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input pl-10 w-full"
                />
              </div>
              {errors.password && (
                <div className="mt-1 text-sm text-red-600">{errors.password[0]}</div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link href="/forgot-password" className="text-primary hover:text-primary/80">
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            <div>
              <LoadingButton type="submit" className="w-full" isLoading={isLoading} disabled={isLoading}>
                Se connecter
              </LoadingButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
