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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Diagnostics</h1>
        <button
          onClick={() => {
            setEditingDiagnosis(null);
            setIsFormOpen(true);
          }}
          className="btn-primary"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouveau diagnostic
        </button>
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
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{diagnosis.user_name || 'Moi'}</h3>
                    <p className="text-sm text-gray-500">{diagnosis.date ? new Date(diagnosis.date).toLocaleDateString('fr-FR') : ''}</p>
                  </div>
                </div>
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

              <div className="grid gap-4">
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
                    <p className="mt-1 text-gray-600">{diagnosis.recommendations}</p>
                  </div>
                )}

                {diagnosis.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Notes</h4>
                    <p className="mt-1 text-gray-600">{diagnosis.notes}</p>
                  </div>
                )}

                {diagnosis.photos && diagnosis.photos.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Photos</h4>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {diagnosis.photos.map((photo, index) => {
                        const src = typeof photo === 'string' ? photo : photo?.url;
                        if (!src) return null;
                        return (
                          <img
                            key={index}
                            src={src}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
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
