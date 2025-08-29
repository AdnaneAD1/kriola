'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Lock } from 'lucide-react'
import { AuthLogo } from '../../../../components/ui/AuthLogo'
// import { useAuth, translateStatus } from '@/hooks/auth'
import AuthSessionStatus from '@/app/(auth)/AuthSessionStatus'
import { LoadingButton } from '@/components/ui/LoadingButton'
import { useUsers } from '@/hooks/useUsers'
import { useSearchParams } from 'next/navigation'

export default function PasswordReset({ params }) {
  const { confirmResetPassword } = useUsers()
  const searchParams = useSearchParams()

  const [formData, setFormData] = useState({
    password: '',
    password_confirmation: '',
  })

  const [errors, setErrors] = useState([])
  const [status, setStatus] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const submitForm = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      setErrors({})
      setStatus(null)
      if (formData.password !== formData.password_confirmation) {
        setErrors({ password_confirmation: ['Les mots de passe ne correspondent pas'] })
        return
      }
      const oobCode = searchParams.get('oobCode') || params.token
      await confirmResetPassword(oobCode, formData.password)
      setStatus('Mot de passe réinitialisé avec succès. Vous pouvez vous connecter.')
    } finally {
      setIsLoading(false)
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
          Réinitialisation du mot de passe
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm rounded-lg sm:px-10">
          <div className="mb-4 text-sm text-gray-600">
            Veuillez définir un nouveau mot de passe.
          </div>

          <AuthSessionStatus className="mb-4" status={status} />

          <form className="space-y-6" onSubmit={submitForm}>
            {/* Email non requis pour la confirmation Firebase */}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Nouveau mot de passe
              </label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  name="password"
                  type="password"
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

            <div>
              <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
                Confirmer le mot de passe
              </label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password_confirmation"
                  name="password_confirmation"
                  type="password"
                  required
                  value={formData.password_confirmation}
                  onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                  className="input pl-10 w-full"
                />
              </div>
              {errors.password_confirmation && (
                <div className="mt-1 text-sm text-red-600">{errors.password_confirmation[0]}</div>
              )}
            </div>

            <div>
              <LoadingButton type="submit" className="w-full" isLoading={isLoading}>
                Réinitialiser le mot de passe
              </LoadingButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
