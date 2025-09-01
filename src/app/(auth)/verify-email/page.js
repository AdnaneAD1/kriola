'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, RefreshCw, LogOut } from 'lucide-react'
import { AuthLogo } from '../../../components/ui/AuthLogo'
// import { useAuth, translateStatus } from '@/hooks/auth'
import AuthSessionStatus from '@/app/(auth)/AuthSessionStatus'
import { LoadingButton } from '@/components/ui/LoadingButton'
import { useUsers } from '@/hooks/useUsers'
import { firebaseAuth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'

export default function VerifyEmail() {
  const { resendVerificationEmail, signOutUser, currentUser, markEmailAsVerified } = useUsers()
  const router = useRouter()

  const [status, setStatus] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const resendingRef = useRef(false)

  const resendEmail = async () => {
    if (resendingRef.current) return
    resendingRef.current = true
    setIsLoading(true)
    
    try {
      await resendVerificationEmail()
      setStatus("Email de vérification renvoyé. Veuillez vérifier votre boîte mail.")
    } catch (error) {
      const code = error?.code
      if (code === 'auth/too-many-requests') {
        setStatus('Trop de tentatives. Veuillez réessayer plus tard.')
      } else if (code === 'auth/network-request-failed') {
        setStatus('Problème réseau. Vérifiez votre connexion et réessayez.')
      } else {
        setStatus("Impossible d'envoyer l'email de vérification. Réessayez plus tard.")
      }
    } finally {
      setIsLoading(false)
      resendingRef.current = false
    }
  }

  // Auto-redirect when Firebase email becomes verified
  useEffect(() => {
    let timer;
    const checkVerification = async () => {
      const fbUser = firebaseAuth.currentUser;
      if (!fbUser) return;
      try {
        await fbUser.reload();
      } catch (_) {}
      if (fbUser.emailVerified) {
        // Optionally mark Firestore user as verified
        if (currentUser?.id) {
          try { await markEmailAsVerified(currentUser.id); } catch (_) {}
        }
        router.replace('/dashboard');
      }
    };
    // First immediate check then poll for a short time
    checkVerification();
    timer = setInterval(checkVerification, 3000);
    return () => clearInterval(timer);
  }, [currentUser?.id, markEmailAsVerified, router])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOutUser()
      router.replace('/login')
    } finally {
      setIsLoggingOut(false)
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
          Vérification de l&apos;email
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
            <LoadingButton
              onClick={resendEmail}
              type="button"
              className="w-full flex justify-center items-center"
              isLoading={isLoading}
              disabled={isLoading}
            >
              {!isLoading && <RefreshCw className="w-5 h-5 mr-2" />}
              Renvoyer l&apos;email de vérification
            </LoadingButton>

            <LoadingButton
              onClick={handleLogout}
              type="button"
              className="btn-outline w-full flex justify-center items-center"
              isLoading={isLoggingOut}
              disabled={isLoggingOut}
            >
              {!isLoggingOut && <LogOut className="w-5 h-5 mr-2" />}
              Se déconnecter
            </LoadingButton>

            <Link
              href="/"
              className="btn-outline w-full flex justify-center items-center"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

