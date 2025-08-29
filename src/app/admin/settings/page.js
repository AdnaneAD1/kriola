'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAdminSettings } from '@/hooks/useAdminSettings'
import { useUsers } from '@/hooks/useUsers'
import { LogOut } from 'lucide-react'

export default function Settings() {
    const { user, errors, status, loading, updateProfile, updatePassword } = useAdminSettings()
    const { signOutUser } = useUsers()
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
    })
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    })

    // Local state to scope errors/success per form
    const [lastAction, setLastAction] = useState(null) // 'profile' | 'password'
    const [profileErrors, setProfileErrors] = useState([])
    const [passwordErrors, setPasswordErrors] = useState([])

    // Keep inputs in sync when user info loads/changes
    useEffect(() => {
        if (user) {
            setProfileData({
                name: user?.name || '',
                email: user?.email || '',
            })
        }
    }, [user])

    const emailRegex = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, [])

    const handleProfileSubmit = async (e) => {
        e.preventDefault()
        setLastAction('profile')
        setProfileErrors([])
        // Client-side validation
        const errs = []
        if (!profileData.name?.trim()) errs.push({ message: 'Le nom est requis.' })
        if (!profileData.email?.trim() || !emailRegex.test(profileData.email)) errs.push({ message: "Email invalide." })
        if (errs.length) {
            setProfileErrors(errs)
            return
        }
        await updateProfile(profileData)
    }

    const handlePasswordSubmit = async (e) => {
        e.preventDefault()
        setLastAction('password')
        setPasswordErrors([])
        // Client-side validation
        const errs = []
        if (!passwordData.current_password) errs.push({ message: 'Mot de passe actuel requis.' })
        if (!passwordData.password || passwordData.password.length < 6) errs.push({ message: 'Le nouveau mot de passe doit contenir au moins 6 caractères.' })
        if (passwordData.password !== passwordData.password_confirmation) errs.push({ message: 'La confirmation du mot de passe ne correspond pas.' })
        if (errs.length) {
            setPasswordErrors(errs)
            return
        }
        await updatePassword(passwordData)
        setPasswordData({
            current_password: '',
            password: '',
            password_confirmation: '',
        })
    }

    return (
        <div className="py-12">
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                {/* Profil */}
                <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                    <div className="max-w-xl">
                        <h2 className="text-lg font-medium text-gray-900">
                            Informations du profil
                        </h2>
                        <form onSubmit={handleProfileSubmit} className="mt-6 space-y-6">
                            {profileErrors.length > 0 && (
                                <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                                    <ul className="list-disc list-inside">
                                        {profileErrors.map((e, i) => (
                                            <li key={i}>{e.message || String(e)}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Nom
                                </label>
                                <input
                                    type="text"
                                    value={profileData.name}
                                    onChange={e => setProfileData({...profileData, name: e.target.value})}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={profileData.email}
                                    onChange={e => setProfileData({...profileData, email: e.target.value})}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                    disabled={loading}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary">
                                Sauvegarder
                            </button>

                            {lastAction === 'profile' && status === 'profile-updated' && (
                                <p className="text-sm text-green-600">Profil mis à jour avec succès.</p>
                            )}
                            {lastAction === 'profile' && Array.isArray(errors) && errors.length > 0 && profileErrors.length === 0 && (
                                <div className="mt-2 space-y-1">
                                    {errors.map((e, i) => (
                                        <p key={i} className="text-sm text-red-600">{e.message || String(e)}</p>
                                    ))}
                                </div>
                            )}
                        </form>
                    </div>
                </div>

                {/* Mot de passe */}
                <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                    <div className="max-w-xl">
                        <h2 className="text-lg font-medium text-gray-900">
                            Mettre à jour le mot de passe
                        </h2>
                        <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-6">
                            {passwordErrors.length > 0 && (
                                <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                                    <ul className="list-disc list-inside">
                                        {passwordErrors.map((e, i) => (
                                            <li key={i}>{e.message || String(e)}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Mot de passe actuel
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.current_password}
                                    onChange={e => setPasswordData({...passwordData, current_password: e.target.value})}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Nouveau mot de passe
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.password}
                                    onChange={e => setPasswordData({...passwordData, password: e.target.value})}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Confirmer le mot de passe
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.password_confirmation}
                                    onChange={e => setPasswordData({...passwordData, password_confirmation: e.target.value})}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                    disabled={loading}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary">
                                Sauvegarder
                            </button>

                            {lastAction === 'password' && status === 'password-updated' && (
                                <p className="text-sm text-green-600">Mot de passe mis à jour avec succès.</p>
                            )}
                            {lastAction === 'password' && Array.isArray(errors) && errors.length > 0 && passwordErrors.length === 0 && (
                                <div className="mt-2 space-y-1">
                                    {errors.map((e, i) => (
                                        <p key={i} className="text-sm text-red-600">{e.message || String(e)}</p>
                                    ))}
                                </div>
                            )}
                        </form>
                    </div>
                </div>
                {/* Déconnexion */}
                <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                    <div className="max-w-xl">
                        <h2 className="text-lg font-medium text-gray-900">
                            Déconnexion
                        </h2>
                        <div className="mt-6">
                            <p className="text-sm text-gray-600 mb-4">
                                Cliquez sur le bouton ci-dessous pour vous déconnecter de votre compte.
                            </p>
                            <button
                                onClick={() => {
                                    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
                                        signOutUser()
                                    }
                                }}
                                className="inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-700 active:bg-red-700 focus:outline-none focus:border-red-700 focus:ring ring-red-300 disabled:opacity-25 transition ease-in-out duration-150">
                                <LogOut className="w-4 h-4 mr-2" />
                                Se déconnecter
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}