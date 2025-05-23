'use client'

import { useEffect, useState } from 'react';
import { Dialog } from '../ui/Dialog';
import { LoadingButton } from '../ui/LoadingButton';

export function DiagnosisForm({ isOpen, onClose, onSubmit, diagnosis }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (diagnosis) {
      const form = document.getElementById('diagnosisForm');
      if (form) {
        form.date.value = diagnosis.date;
        form.skin_type.value = diagnosis.skin_type;
        
        // Réinitialiser les checkboxes
        form.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
          checkbox.checked = false;
        });

        // Cocher les préoccupations existantes
        diagnosis.concerns.forEach(concern => {
          const checkbox = form.querySelector(`input[name="concerns"][value="${concern}"]`);
          if (checkbox) checkbox.checked = true;
        });

        if (diagnosis.notes) {
          form.notes.value = diagnosis.notes;
        }
      }
    }
  }, [diagnosis]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(event.target);
      const data = {
        date: formData.get('date'),
        skin_type: formData.get('skin_type'),
        concerns: formData.getAll('concerns'),
        notes: formData.get('notes')
      };

      // Ajouter les photos si présentes
      const photos = formData.getAll('photos');
      if (photos.length > 0 && photos[0].size > 0) {
        data.photos = photos;
      }

      await onSubmit(data);
      event.target.reset();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={diagnosis ? 'Modifier le diagnostic' : 'Nouveau diagnostic'}
    >
      <form id="diagnosisForm" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            name="date"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Type de peau</label>
          <select
            name="skin_type"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          >
            <option value="">Sélectionnez un type</option>
            <option value="normal">Normale</option>
            <option value="dry">Sèche</option>
            <option value="oily">Grasse</option>
            <option value="combination">Mixte</option>
            <option value="sensitive">Sensible</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Préoccupations</label>
          <div className="mt-2 space-y-2">
            <div>
              <input type="checkbox" name="concerns" value="acne" id="acne" className="mr-2" />
              <label htmlFor="acne">Acné</label>
            </div>
            <div>
              <input type="checkbox" name="concerns" value="wrinkles" id="wrinkles" className="mr-2" />
              <label htmlFor="wrinkles">Rides</label>
            </div>
            <div>
              <input type="checkbox" name="concerns" value="dark_spots" id="dark_spots" className="mr-2" />
              <label htmlFor="dark_spots">Taches brunes</label>
            </div>
            <div>
              <input type="checkbox" name="concerns" value="redness" id="redness" className="mr-2" />
              <label htmlFor="redness">Rougeurs</label>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Notes additionnelles</label>
          <textarea
            name="notes"
            rows={2}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Photos</label>
          <input
            type="file"
            name="photos"
            accept="image/*"
            multiple
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Annuler
          </button>
          <LoadingButton
            type="submit"
            isLoading={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            {diagnosis ? 'Modifier' : 'Créer'}
          </LoadingButton>
        </div>
      </form>
    </Dialog>
  );
}
