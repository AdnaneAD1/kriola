'use client'

import { useEffect, useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { TreatmentForm } from '../../../components/forms/TreatmentForm';
import { DropdownMenu } from '../../../components/ui/DropdownMenu';
import { useTreatments } from '@/hooks/useTreatments';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingPage } from '@/components/ui/LoadingSpinner';

export default function AdminTreatments() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState(null);
  const { treatments, loading, error, deleteTreatment, subscribeToTreatments, toggleTreatmentStatus } = useTreatments();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Abonnement temps réel aux traitements avec recherche
  useEffect(() => {
    const unsubscribe = subscribeToTreatments({
      orderBy: 'name',
      orderDirection: 'asc',
      searchTerm: search?.trim() || undefined,
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [subscribeToTreatments, search]);

  // Reset pagination when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Scroll to top when page changes
  useEffect(() => {
    document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  if (loading) {
    return <LoadingPage message="Chargement des traitements..." />;
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

  const handleToggleStatus = async (treatment) => {
    try {
      await toggleTreatmentStatus(treatment.id, !treatment.isActive);
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

  const totalItems = (treatments || []).length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedTreatments = (treatments || []).slice(startIndex, startIndex + pageSize);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold whitespace-nowrap">Gestion des traitements</h1>
        <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="input w-full sm:w-64"
          />
          <button
            onClick={() => {
              setEditingTreatment(null);
              setIsFormOpen(true);
            }}
            className="btn-primary w-full sm:w-auto"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouveau traitement
          </button>
        </div>
      </div>

      {treatments && treatments.length > 0 ? (
        <div className="grid gap-6">
          {paginatedTreatments.map((treatment) => (
            <div key={treatment.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-primary">{treatment.name}</h3>
                    <p className="text-sm text-gray-500">{treatment.category}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`
                    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${treatment.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                    }
                  `}>
                    {treatment.isActive ? 'Actif' : 'Inactif'}
                  </span>
                  <DropdownMenu
                    items={[
                      {
                        label: 'Modifier',
                        onClick: () => handleEdit(treatment)
                      },
                      {
                        label: treatment.isActive ? 'Désactiver' : 'Activer',
                        onClick: () => handleToggleStatus(treatment)
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
          <div className="flex items-center justify-between mt-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="px-3 py-2 rounded-md border border-gray-300 text-sm disabled:opacity-50"
            >
              Précédent
            </button>
            <span className="text-sm text-gray-600">Page {safePage} sur {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="px-3 py-2 rounded-md border border-gray-300 text-sm disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Sparkles}
          title="Aucun traitement"
          description="Il n'y a actuellement aucun traitement dans le catalogue. Vous pouvez ajouter un nouveau traitement en cliquant sur le bouton ci-dessous."
          actionLabel="Nouveau traitement"
          onAction={() => {
            setEditingTreatment(null);
            setIsFormOpen(true);
          }}
        />
      )}

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
