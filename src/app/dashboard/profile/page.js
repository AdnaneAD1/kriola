'use client'

import { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, LogOut } from 'lucide-react';
import { Alert } from '../../../components/ui/Alert';
import { useProfile } from '../../../hooks/useProfile';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { useAuth } from '@/hooks/auth';

export default function Profile() {
  const { isLoading, error, getProfile, updateProfile, updatePassword } = useProfile();
  const { logout } = useAuth();
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    password: '',
    password_confirmation: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getProfile();
      setFormData({
        name: data.user.name,
        email: data.user.email,
        first_name: data.client.first_name,
        last_name: data.client.last_name,
        phone: data.client.phone
      });
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateProfile(formData);
      setSuccess('Profil mis à jour avec succès');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsPasswordSubmitting(true);
    try {
      await updatePassword(passwordData);
      setSuccess('Mot de passe mis à jour avec succès');
      setIsChangingPassword(false);
      setPasswordData({
        current_password: '',
        password: '',
        password_confirmation: ''
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Erreur lors de la mise à jour du mot de passe:', err);
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mon Profil</h1>
        <LoadingButton
          onClick={handleLogout}
          isLoading={isLoggingOut}
          className="btn-secondary flex items-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Déconnexion
        </LoadingButton>
      </div>

      {error && (
        <Alert type="error">
          {error}
        </Alert>
      )}

      {success && (
        <Alert type="success">
          {success}
        </Alert>
      )}

      {/* Informations personnelles */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Informations personnelles</h3>
            <p className="mt-1 text-sm text-gray-500">
              Gérez vos informations personnelles
            </p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="btn-secondary"
          >
            {isEditing ? 'Annuler' : 'Modifier'}
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom d'utilisateur
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input w-full"
                  required
                />
              ) : (
                <p className="text-gray-900">{formData.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input w-full"
                  required
                />
              ) : (
                <p className="text-gray-900">{formData.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prénom
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="input w-full"
                  required
                />
              ) : (
                <p className="text-gray-900">{formData.first_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="input w-full"
                  required
                />
              ) : (
                <p className="text-gray-900">{formData.last_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input w-full"
                  required
                />
              ) : (
                <p className="text-gray-900">{formData.phone}</p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex justify-end">
                <LoadingButton
                  type="submit"
                  className="btn-primary"
                  isLoading={isSubmitting}
                >
                  Enregistrer les modifications
                </LoadingButton>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Sécurité */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Sécurité</h3>
            <p className="mt-1 text-sm text-gray-500">
              Gérez votre mot de passe
            </p>
          </div>
          <button
            onClick={() => setIsChangingPassword(!isChangingPassword)}
            className="btn-secondary"
          >
            {isChangingPassword ? 'Annuler' : 'Changer le mot de passe'}
          </button>
        </div>

        {isChangingPassword && (
          <form onSubmit={handlePasswordSubmit}>
            <div className="p-6 grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  name="current_password"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  name="password"
                  value={passwordData.password}
                  onChange={handlePasswordChange}
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  type="password"
                  name="password_confirmation"
                  value={passwordData.password_confirmation}
                  onChange={handlePasswordChange}
                  className="input w-full"
                  required
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex justify-end">
                <LoadingButton
                  type="submit"
                  className="btn-primary"
                  isLoading={isPasswordSubmitting}
                >
                  Mettre à jour le mot de passe
                </LoadingButton>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
