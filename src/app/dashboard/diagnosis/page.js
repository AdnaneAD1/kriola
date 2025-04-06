'use client'

import { useState } from 'react';
import { Plus, User } from 'lucide-react';
import { DiagnosisForm } from '../../../components/forms/DiagnosisForm';
import { DropdownMenu } from '../../../components/ui/DropdownMenu';

export default function Diagnosis() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDiagnosis, setEditingDiagnosis] = useState(null);

  const diagnoses = [
    {
      id: 1,
      date: '2024-04-15',
      patient: 'Marie Dupont',
      skinType: 'Mixte',
      concerns: ['Acné', 'Taches brunes'],
      recommendations: 'Traitement LED + Soin hydratant'
    },
    {
      id: 2,
      date: '2024-04-16',
      patient: 'Jean Martin',
      skinType: 'Grasse',
      concerns: ['Points noirs', 'Pores dilatés'],
      recommendations: 'Peeling + Soin matifiant'
    }
  ];

  const handleEdit = (diagnosis) => {
    setEditingDiagnosis(diagnosis);
    setIsFormOpen(true);
  };

  const handleDelete = (diagnosisId) => {
    // Logique de suppression à implémenter
    console.log('Suppression du diagnostic:', diagnosisId);
  };

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
        {diagnoses.map((diagnosis) => (
          <div key={diagnosis.id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{diagnosis.patient}</h3>
                  <p className="text-sm text-gray-500">{new Date(diagnosis.date).toLocaleDateString('fr-FR')}</p>
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
                <p className="mt-1">{diagnosis.skinType}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700">Préoccupations</h4>
                <div className="mt-1 flex flex-wrap gap-2">
                  {diagnosis.concerns.map((concern, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                    >
                      {concern}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700">Recommandations</h4>
                <p className="mt-1 text-gray-600">{diagnosis.recommendations}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <DiagnosisForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingDiagnosis(null);
        }}
        diagnosis={editingDiagnosis}
      />
    </div>
  );
}
