'use client'

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert } from '../ui/Alert';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export function AuthForm({ mode, onSuccess }) {
  const router = useRouter();
  const isLogin = mode === 'login';
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });

  // Réinitialiser le formulaire lors du changement de mode
  useEffect(() => {
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: ''
    });
    setError(null);
    setSuccessMessage(null);
  }, [mode]);

  const validateForm = () => {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Veuillez entrer une adresse email valide');
      return false;
    }

    // Password validation
    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }

    // Name validation for registration
    if (!isLogin) {
      if (formData.firstName.length < 2 || formData.lastName.length < 2) {
        setError('Les noms doivent contenir au moins 2 caractères');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      
      if (isLogin) {
        // Simulation de la connexion (à remplacer par l'appel API réel)
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Redirection vers le tableau de bord après la connexion
        onSuccess?.();
        router.push('/dashboard');
      } else {
        // Simulation de l'inscription (à remplacer par l'appel API réel)
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSuccessMessage(
          'Votre compte a été créé avec succès ! Veuillez vérifier votre boîte mail pour confirmer votre adresse email.'
        );
        // Réinitialiser le formulaire après l'inscription
        setFormData({
          email: '',
          password: '',
          firstName: '',
          lastName: ''
        });
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(isLogin 
        ? 'Erreur lors de la connexion. Veuillez réessayer.'
        : 'Erreur lors de l\'inscription. Veuillez réessayer.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.trim()
    }));
    setError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert type="success" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {!isLogin && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              Prénom
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="input mt-1"
              minLength={2}
              required={!isLogin}
              disabled={isLoading}
              autoComplete="given-name"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Nom
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="input mt-1"
              minLength={2}
              required={!isLogin}
              disabled={isLoading}
              autoComplete="family-name"
            />
          </div>
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="input mt-1"
          required
          disabled={isLoading}
          autoComplete="email"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Mot de passe
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="input mt-1"
          required
          disabled={isLoading}
          autoComplete={isLogin ? "current-password" : "new-password"}
          minLength={8}
        />
        {!isLogin && (
          <p className="mt-1 text-sm text-gray-500">
            Le mot de passe doit contenir au moins 8 caractères
          </p>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <LoadingSpinner className="w-5 h-5" />
          ) : (
            isLogin ? 'Se connecter' : 'S\'inscrire'
          )}
        </button>
      </div>
    </form>
  );
}
