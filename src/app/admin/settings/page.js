'use client'

import { useState } from 'react'
import { useAdminSettings } from '@/hooks/useAdminSettings'
import { useAuth } from '@/hooks/auth'
import { LogOut } from 'lucide-react'

export default function Settings() {
    const { user, errors, status, loading, updateProfile, updatePassword } = useAdminSettings()
    const { logout } = useAuth()
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
    })
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    })

    const handleProfileSubmit = async (e) => {
        e.preventDefault()
        await updateProfile(profileData)
    }

    const handlePasswordSubmit = async (e) => {
        e.preventDefault()
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Nom
                                </label>
                                <input
                                    type="text"
                                    value={profileData.name}
                                    onChange={e => setProfileData({...profileData, name: e.target.value})}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                />
                                {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
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
                                />
                                {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary">
                                Sauvegarder
                            </button>

                            {status === 'profile-updated' && (
                                <p className="text-sm text-green-600">Profil mis à jour avec succès.</p>
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Mot de passe actuel
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.current_password}
                                    onChange={e => setPasswordData({...passwordData, current_password: e.target.value})}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                />
                                {errors.current_password && <p className="mt-2 text-sm text-red-600">{errors.current_password}</p>}
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
                                />
                                {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
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
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary">
                                Sauvegarder
                            </button>

                            {status === 'password-updated' && (
                                <p className="text-sm text-green-600">Mot de passe mis à jour avec succès.</p>
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
                                onClick={logout}
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