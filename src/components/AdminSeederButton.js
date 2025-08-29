'use client';

import { useState } from 'react';
import { seedDefaultAdmin } from '@/lib/seedAdmin';
import { Button } from '@/components/ui/Button';

export function AdminSeederButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSeed = async () => {
    setLoading(true);
    setMessage('');
    try {
      const result = await seedDefaultAdmin();
      setMessage(result.message);
    } catch (error) {
      setMessage(error.message || 'Erreur lors de la création de l\'admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 text-center">
      <Button 
        onClick={handleSeed}
        disabled={loading}
        variant="outline"
      >
        {loading ? 'Création en cours...' : 'Créer un admin par défaut'}
      </Button>
      {message && <p className="mt-2 text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}
