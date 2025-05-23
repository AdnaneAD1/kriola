'use client'

import { useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { TreatmentForm } from '../../../components/forms/TreatmentForm';
import { DropdownMenu } from '../../../components/ui/DropdownMenu';
import { useTreatments } from '@/hooks/useTreatments';

export default function AdminTreatments() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState(null);
  const { treatments, loading, error, createTreatment, updateTreatment, deleteTreatment } = useTreatments();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Une erreur est survenue lors du chargement des traitements.</div>
      </div>
    );
  }

  // Données de secours si l'API ne renvoie rien
  const mockTreatments = [
    {
      id: 1,
      name: 'Traitement Anti-âge',
      category: 'Anti-âge',
      duration: '1h',
      price: 250,
      description: 'Traitement complet pour réduire les signes du vieillissement',
      status: 'active',
      bookings: 45,
      rating: 4.8,

    },
    {
      id: 2,
      name: 'Lifting Non-chirurgical',
      category: 'Lifting',
      duration: '45min',
      price: 200,
      description: 'Alternative non invasive au lifting chirurgical',
      status: 'active',
      bookings: 32,
      rating: 4.6,

    },
    {
      id: 3,
      name: 'Soin Éclaircissant',
      category: 'Soins',
      duration: '30min',
      price: 150,
      description: 'Soin pour éclaircir et uniformiser le teint',
      status: 'inactive',
      bookings: 28,
      rating: 4.7,

    }
  ];

  const handleEdit = (treatment) => {
    setEditingTreatment(treatment);
    setIsFormOpen(true);
  };

  const handleDelete = async (treatmentId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce traitement ?')) {
      try {
        await deleteTreatment(treatmentId);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleToggleStatus = async (treatmentId, currentStatus) => {
    try {
      await updateTreatment(treatmentId, {
        status: currentStatus === 'active' ? 'inactive' : 'active'
      });
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des traitements</h1>
        <button
          onClick={() => {
            setEditingTreatment(null);
            setIsFormOpen(true);
          }}
          className="btn-primary"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouveau traitement
        </button>
      </div>

      <div className="grid gap-6">
        {treatments?.map((treatment) => (
          <div key={treatment.id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{treatment.name}</h3>
                  <p className="text-sm text-gray-500">{treatment.category}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`
                  inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${treatment.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                  }
                `}>
                  {treatment.status === 'active' ? 'Actif' : 'Inactif'}
                </span>
                <DropdownMenu
                  items={[
                    {
                      label: 'Modifier',
                      onClick: () => handleEdit(treatment)
                    },
                    {
                      label: 'Supprimer',
                      onClick: () => handleDelete(treatment.id),
                      destructive: true
                    }
                  ]}
                />
              </div>
            </div>

            <div className="grid gap-4">
              <p className="text-gray-600">{treatment.description}</p>

              <div className="flex flex-wrap gap-6">
                <div>
                  <span className="text-sm font-medium text-gray-700">Prix:</span>
                  <span className="ml-2 text-lg font-semibold text-primary">
                    {formatPrice(treatment.price)}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Durée:</span>
                  <span className="ml-2">{treatment.duration} minutes</span>
                </div>

              </div>


            </div>
          </div>
        ))}
      </div>

      <TreatmentForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTreatment(null);
        }}
        treatment={editingTreatment}
      />
    </div>
  );
}
