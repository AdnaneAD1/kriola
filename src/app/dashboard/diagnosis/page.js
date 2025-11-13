'use client'

import { useEffect, useState } from 'react';
import { Plus, User, FileText } from 'lucide-react';
import { DiagnosisForm } from '../../../components/forms/DiagnosisForm';
import { DropdownMenu } from '../../../components/ui/DropdownMenu';
import { useDiagnoses } from '@/hooks/useDiagnoses';
import { EmptyState } from '@/components/ui/EmptyState';
import { useUsers } from '@/hooks/useUsers';

export default function Diagnosis() {
  const { currentUser } = useUsers();
  const { diagnoses, loading, error, createDiagnosis, updateDiagnosis, hardDeleteDiagnosis, subscribeToDiagnoses } = useDiagnoses();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDiagnosis, setEditingDiagnosis] = useState(null);

  useEffect(() => {
    if (!currentUser?.id) return;
    const unsub = subscribeToDiagnoses({ userId: currentUser.id });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [currentUser?.id, subscribeToDiagnoses]);

  const handleSubmit = async (data) => {
    try {
      if (editingDiagnosis) {
        await updateDiagnosis({ id: editingDiagnosis.id, ...data });
      } else {
        await createDiagnosis({ ...data, userId: currentUser?.id });
      }
      setIsFormOpen(false);
      setEditingDiagnosis(null);
    } catch (error) {
      console.error('Erreur lors du traitement du diagnostic:', error);
    }
  };

  const handleEdit = (diagnosis) => {
    setEditingDiagnosis(diagnosis);
    setIsFormOpen(true);
  };

  const handleDelete = async (diagnosisId) => {
    if (window.confirm('Suppression définitive: cette action est irréversible. Continuer ?')) {
      try {
        await hardDeleteDiagnosis(diagnosisId);
      } catch (error) {
        console.error('Erreur lors de la suppression définitive du diagnostic:', error);
      }
    }
  };

  // if (isLoading) {
  //   return <div>Chargement...</div>;
  // }

  // if (error) {
  //   return <div className="text-red-500">{error}</div>;
  // }

  return (
    <div className="px-4 sm:px-6">
      <div className="mb-6 flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold whitespace-nowrap">Diagnostics</h1>
        <div className="w-full md:w-auto">
          <button
            onClick={() => {
              setEditingDiagnosis(null);
              setIsFormOpen(true);
            }}
            className="btn-primary w-full sm:w-auto"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouveau diagnostic
          </button>
        </div>
      </div>

      <div className="grid gap-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : diagnoses.length > 0 ? (
          diagnoses.map((diagnosis) => (
            <div key={diagnosis.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
                {/* Header utilisateur + Informations principales - 5/12 de l'espace */}
                <div className="lg:col-span-5 space-y-4 min-w-0">
                  {/* Header utilisateur */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{diagnosis.user_name || 'Moi'}</h3>
                      <p className="text-sm text-gray-500">{diagnosis.date ? new Date(diagnosis.date).toLocaleDateString('fr-FR') : ''}</p>
                    </div>
                  </div>
                  
                  {/* Informations du diagnostic */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Type de peau</h4>
                    <p className="mt-1">{diagnosis.skin_type}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Préoccupations</h4>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {(diagnosis.concerns || []).map((concern, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                        >
                          {concern}
                        </span>
                      ))}
                    </div>
                  </div>

                  {diagnosis.treatments && diagnosis.treatments.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Traitements recommandés</h4>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {diagnosis.treatments.map((treatment, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                          >
                            {treatment}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {diagnosis.recommendations && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Recommandations</h4>
                      <p className="mt-1 text-gray-600 break-words overflow-hidden">{diagnosis.recommendations}</p>
                    </div>
                  )}

                  {diagnosis.notes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Notes</h4>
                      <p className="mt-1 text-gray-600 break-words overflow-hidden">{diagnosis.notes}</p>
                    </div>
                  )}
                </div>

                {/* Photos - 5/12 de l'espace, égal aux infos */}
                {diagnosis.photos && diagnosis.photos.length > 0 && (
                  <div className="lg:col-span-5 flex flex-col min-w-0">
                    {diagnosis.photos.length === 1 ? (
                      // Une seule photo : affichage pleine largeur
                      <img
                        src={typeof diagnosis.photos[0] === 'string' ? diagnosis.photos[0] : diagnosis.photos[0]?.url}
                        alt="Photo du diagnostic"
                        className="w-full h-64 object-cover rounded-lg shadow-sm border border-gray-200"
                      />
                    ) : diagnosis.photos.length === 2 ? (
                      // Deux photos : grille 2x1 (côte à côte)
                      <div className="grid grid-cols-2 gap-2">
                        {diagnosis.photos.slice(0, 2).map((photo, index) => {
                          const src = typeof photo === 'string' ? photo : photo?.url;
                          if (!src) return null;
                          return (
                            <img
                              key={index}
                              src={src}
                              alt={`Photo ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg shadow-sm border border-gray-200"
                            />
                          );
                        })}
                      </div>
                    ) : diagnosis.photos.length === 3 ? (
                      // Trois photos : une grande + deux petites
                      <div className="space-y-2">
                        <img
                          src={typeof diagnosis.photos[0] === 'string' ? diagnosis.photos[0] : diagnosis.photos[0]?.url}
                          alt="Photo principale"
                          className="w-full h-40 object-cover rounded-lg shadow-sm border border-gray-200"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          {diagnosis.photos.slice(1, 3).map((photo, index) => {
                            const src = typeof photo === 'string' ? photo : photo?.url;
                            if (!src) return null;
                            return (
                              <img
                                key={index + 1}
                                src={src}
                                alt={`Photo ${index + 2}`}
                                className="w-full h-24 object-cover rounded-lg shadow-sm border border-gray-200"
                              />
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      // Quatre photos ou plus : grille 2x2 + indicateur
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          {diagnosis.photos.slice(0, 4).map((photo, index) => {
                            const src = typeof photo === 'string' ? photo : photo?.url;
                            if (!src) return null;
                            const isLast = index === 3 && diagnosis.photos.length > 4;
                            return (
                              <div key={index} className="relative">
                                <img
                                  src={src}
                                  alt={`Photo ${index + 1}`}
                                  className="w-full h-32 object-cover rounded-lg shadow-sm border border-gray-200"
                                />
                                {isLast && (
                                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-medium text-sm">
                                      +{diagnosis.photos.length - 4}
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        {diagnosis.photos.length > 4 && (
                          <p className="text-xs text-gray-500 text-center">
                            {diagnosis.photos.length} photos au total
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Menu trois points - 2/12 de l'espace (le plus petit) */}
                <div className="lg:col-span-2 flex justify-end min-w-0">
                  <div className="h-16 flex items-center">
                    <DropdownMenu
                    items={[
                      {
                        label: 'Modifier',
                        onClick: () => handleEdit(diagnosis)
                      },
                      {
                        label: 'Supprimer',
                        onClick: () => handleDelete(diagnosis.id),
                        destructive: true
                      }
                    ]}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            icon={FileText}
            title="Aucun diagnostic"
            description="Vous n'avez pas encore créé de diagnostic. Cliquez sur le bouton 'Nouveau diagnostic' pour commencer."
            actionLabel="Nouveau diagnostic"
            onAction={() => {
              setEditingDiagnosis(null);
              setIsFormOpen(true);
            }}
          />
        )}
      </div>

      <DiagnosisForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingDiagnosis(null);
        }}
        onSubmit={handleSubmit}
        diagnosis={editingDiagnosis}
      />
    </div>
  );
}
