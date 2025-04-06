'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert } from '../ui/Alert';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export function DiagnosisForm({ onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    skinType: '',
    hairType: '',
    concerns: [],
    allergies: [],
    medicalHistory: '',
    currentProducts: []
  });

  const HAIR_TYPES = [
    { value: '1a', label: 'Type 1A - Cheveux raides' },
    { value: '1b', label: 'Type 1B - Cheveux raides avec texture' },
    { value: '1c', label: 'Type 1C - Cheveux raides avec volume' },
    { value: '2a', label: 'Type 2A - Cheveux ondulés légers' },
    { value: '2b', label: 'Type 2B - Cheveux ondulés définis' },
    { value: '2c', label: 'Type 2C - Cheveux ondulés larges' },
    { value: '3a', label: 'Type 3A - Boucles légères' },
    { value: '3b', label: 'Type 3B - Boucles moyennes' },
    { value: '3c', label: 'Type 3C - Boucles serrées' },
    { value: '4a', label: 'Type 4A - Cheveux crépus légers' },
    { value: '4b', label: 'Type 4B - Cheveux crépus moyens' },
    { value: '4c', label: 'Type 4C - Cheveux crépus serrés' }
  ];

  const CONCERNS = [
    { value: 'alopecie', label: 'Alopécie de traction' },
    { value: 'blepharochalasis', label: 'Blépharochalasis' },
    { value: 'chute', label: 'Chute de cheveux' },
    { value: 'secheresse', label: 'Sécheresse' },
    { value: 'demangeaisons', label: 'Démangeaisons' }
  ];

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.skinType || !formData.hairType || formData.concerns.length === 0) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setIsLoading(true);

      // Simulation de l'envoi du diagnostic (à remplacer par l'appel API réel)
      await new Promise(resolve => setTimeout(resolve, 1000));

      onSuccess?.(formData);
      
      // Rediriger vers le dashboard avec un message de succès
      router.push('/dashboard?success=true');

    } catch (err) {
      console.error('Erreur lors de la soumission du diagnostic:', err);
      setError('Une erreur est survenue lors de l\'envoi du diagnostic. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkinTypeChange = (type) => {
    setFormData(prev => ({ ...prev, skinType: type }));
  };

  const handleHairTypeChange = (e) => {
    setFormData(prev => ({ ...prev, hairType: e.target.value }));
  };

  const handleConcernToggle = (concern) => {
    setFormData(prev => ({
      ...prev,
      concerns: prev.concerns.includes(concern)
        ? prev.concerns.filter(c => c !== concern)
        : [...prev.concerns, concern]
    }));
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Type de peau</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['normal', 'sec', 'gras', 'mixte'].map((type) => (
            <label
              key={type}
              className={`
                relative flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer
                ${formData.skinType === type ? 'border-primary bg-primary/5' : 'border-gray-200'}
              `}
            >
              <input
                type="radio"
                name="skinType"
                value={type}
                checked={formData.skinType === type}
                onChange={() => handleSkinTypeChange(type)}
                className="sr-only"
              />
              <span className="capitalize">{type}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Type de cheveux</h3>
        <select
          value={formData.hairType}
          onChange={handleHairTypeChange}
          className="input"
        >
          <option value="">Sélectionnez un type</option>
          {HAIR_TYPES.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Problèmes rencontrés</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {CONCERNS.map(({ value, label }) => (
            <label
              key={value}
              className={`
                relative flex items-center p-4 rounded-xl border-2 cursor-pointer
                ${formData.concerns.includes(value) ? 'border-primary bg-primary/5' : 'border-gray-200'}
              `}
            >
              <input
                type="checkbox"
                checked={formData.concerns.includes(value)}
                onChange={() => handleConcernToggle(value)}
                className="sr-only"
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Antécédents médicaux</h3>
        <textarea
          name="medicalHistory"
          value={formData.medicalHistory}
          onChange={handleTextChange}
          className="input h-32"
          placeholder="Décrivez vos antécédents médicaux pertinents..."
        />
      </div>

      {error && <Alert type="error">{error}</Alert>}

      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full"
      >
        {isLoading ? <LoadingSpinner /> : 'Envoyer mon diagnostic'}
      </button>
    </form>
  );
}
