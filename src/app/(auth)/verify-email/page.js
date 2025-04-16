'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, RefreshCw, LogOut } from 'lucide-react'
import { Logo } from '../../../components/ui/Logo'
import { useAuth } from '@/hooks/auth'
import AuthSessionStatus from '@/app/(auth)/AuthSessionStatus'

export default function VerifyEmail() {
  const { logout, resendEmailVerification } = useAuth({
    middleware: 'auth',
    redirectIfAuthenticated: '/dashboard',
  })

  const [status, setStatus] = useState(null)

  const resendEmail = () => {
    resendEmailVerification({
      setStatus,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/" className="inline-block">
            <Logo />
          </Link>
        </div>

        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Vérification de l'email
        </h2>

        <div className="mt-8 bg-white py-8 px-4 shadow-sm rounded-lg sm:px-10">
          <div className="mb-4 text-sm text-gray-600">
            Merci pour votre inscription ! Avant de commencer, pourriez-vous vérifier
            votre adresse e-mail en cliquant sur le lien que nous venons de vous envoyer ?
          </div>

          <div className="mt-4">
            <AuthSessionStatus className="mb-4" status={status} />
          </div>

          <div className="mt-4 flex flex-col space-y-4">
            <button
              onClick={resendEmail}
              type="button"
              className="btn-primary w-full flex justify-center items-center"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Renvoyer l'email de vérification
            </button>

            <button
              onClick={logout}
              type="button"
              className="btn-outline w-full flex justify-center items-center"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Se déconnecter
            </button>

            <Link
              href="/"
              className="btn-outline w-full flex justify-center items-center"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

