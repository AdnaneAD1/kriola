'use client'

import { useState } from 'react';
import Link from 'next/link';
import { User, Mail, Lock, Phone, UserPlus } from 'lucide-react';
import { AuthLogo } from '../../../components/ui/AuthLogo';
// import { useAuth, isIOS } from '@/hooks/auth';
import AuthSessionStatus from '@/app/(auth)/AuthSessionStatus';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { useUsers } from '@/hooks/useUsers';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    confirmPassword: '',
    terms: false
  });
  const [errors, setErrors] = useState([]);
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  // const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { createUserWithAuth } = useUsers();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setStatus(null);
    setIsLoading(true);

    try {
      // Validation des champs
      const validationErrors = {};

      if (!formData.firstName.trim()) {
        validationErrors.firstName = ['Le prénom est requis'];
      }
      if (!formData.lastName.trim()) {
        validationErrors.lastName = ['Le nom est requis'];
      }
      if (!formData.email.trim()) {
        validationErrors.email = ['L\'email est requis'];
      }
      if (!formData.password) {
        validationErrors.password = ['Le mot de passe est requis'];
      }
      if (formData.password !== formData.password_confirmation) {
        validationErrors.password_confirmation = ['Les mots de passe ne correspondent pas'];
      }
      if (!formData.terms) {
        validationErrors.terms = ['Vous devez accepter les conditions d\'utilisation'];
      }

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setIsLoading(false);
        return;
      }

      const newUser = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        password: formData.password,
        role: 'client',
        phoneNumber: formData.phone,
        firstName: formData.firstName,
        lastName: formData.lastName,
      };

      await createUserWithAuth(newUser);
      setStatus('Votre compte a été créé. Un email de vérification vous a été envoyé.');
      // Redirection après un court délai
      setTimeout(() => {
        window.location = '/verify-email';
      }, 800);
      
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      setStatus('Une erreur est survenue lors de l\'inscription.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/" className="inline-block">
            <AuthLogo />
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Créer un compte
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ou{' '}
          <Link href="/login" className="font-medium text-primary hover:text-primary/80">
            connectez-vous à votre compte
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm rounded-lg sm:px-10">
          {status && (
            <div className="mb-4 text-sm font-medium text-green-600">
              {status}
            </div>
          )}
          {errors.general && (
            <div className="mb-4 text-sm font-medium text-red-600">
              {errors.general}
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  Prénom
                </label>
                <div className="mt-1 relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="input pl-10 w-full"
                  />
                </div>
                {errors.firstName && (
                  <div className="mt-1 text-sm text-red-600">{errors.firstName[0]}</div>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Nom
                </label>
                <div className="mt-1 relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="input pl-10 w-full"
                  />
                </div>
                {errors.lastName && (
                  <div className="mt-1 text-sm text-red-600">{errors.lastName[0]}</div>
                )}
              </div>
            </div>

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
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Numéro de téléphone
              </label>
              <div className="mt-1 relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input pl-10 w-full"
                  placeholder="+33 6 12 34 56 78"
                />
              </div>
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
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input pl-10 w-full"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmer le mot de passe
              </label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.password_confirmation}
                  onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                  className="input pl-10 w-full"
                  placeholder="••••••••"
                />
              </div>
              {errors.password_confirmation && (
                <div className="mt-1 text-sm text-red-600">{errors.password_confirmation[0]}</div>
              )}
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                checked={formData.terms}
                onChange={(e) => setFormData({ ...formData, terms: e.target.checked })}
                className="h-4 w-4 text-primary focus:ring-primary/20 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                J&apos;accepte les{' '}
                <Link href="/terms" className="font-medium text-primary hover:text-primary/80">
                  conditions d&apos;utilisation
                </Link>
                {' '}et la{' '}
                <Link href="/privacy" className="font-medium text-primary hover:text-primary/80">
                  politique de confidentialité
                </Link>
              </label>
              {errors.terms && (
                <div className="mt-1 text-sm text-red-600">{errors.terms[0]}</div>
              )}
            </div>

            <div>
              <LoadingButton
                type="submit"
                className="w-full flex justify-center items-center"
                isLoading={isLoading}
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Créer un compte
              </LoadingButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
