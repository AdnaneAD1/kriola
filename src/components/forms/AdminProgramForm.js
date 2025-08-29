'use client'

import { useEffect, useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { useTreatments } from '@/hooks/useTreatments';
import { useProducts } from '@/hooks/useProducts';
import { usePrograms } from '@/hooks/usePrograms';
import { useUsers } from '@/hooks/useUsers';
import { sendEmail } from '@/lib/emailService';

export function AdminProgramForm({ isOpen, onClose, userId, program }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    treatment_ids: [],
    product_ids: ['none'] // Valeur par défaut
  });

  const [treatments, setTreatments] = useState([]);
  const [products, setProducts] = useState([
    { id: 'none', name: 'Aucun produit' } // Option par défaut
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { getTreatments } = useTreatments();
  const { getProducts } = useProducts();
  const { createProgram, updateProgram } = usePrograms();
  const { getUserById } = useUsers();

  // Prevent selecting past dates in date inputs (use local date, not UTC)
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    if (program) {
      setFormData({
        title: program.title || '',
        description: program.description || '',
        // normalize date fields from program object (may be Date already per hooks)
        start_date: program.startDate ? new Date(program.startDate).toISOString().slice(0, 10) : (program.start_date || ''),
        end_date: program.endDate ? new Date(program.endDate).toISOString().slice(0, 10) : (program.end_date || ''),
        treatment_ids: program.treatments?.map(t => t.id) || [],
        product_ids: program.products?.map(p => p.id) || ['none']
      });
    } else {
      setFormData({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        treatment_ids: [],
        product_ids: ['none']
      });
    }
  }, [program]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [treatmentsList, productsList] = await Promise.all([
          getTreatments({ isActive: true, orderBy: 'name', orderDirection: 'asc' }),
          getProducts({ status: true, orderBy: 'name', orderDirection: 'asc' })
        ]);
        setTreatments(treatmentsList || []);
        setProducts([...products, ...(productsList || [])]);
        setError(null);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setError('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [getTreatments, getProducts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      // Convert dates
      const startDate = formData.start_date ? new Date(`${formData.start_date}T00:00:00`) : null;
      const endDate = formData.end_date ? new Date(`${formData.end_date}T00:00:00`) : null;

      // Map selected IDs to minimal objects {id, name}
      const selectedTreatments = (formData.treatment_ids || [])
        .map((id) => {
          const t = treatments.find((x) => x.id === id);
          return t ? { id: t.id, name: t.name } : null;
        })
        .filter(Boolean);
      const selectedProducts = (formData.product_ids || [])
        .map((id) => {
          const p = products.find((x) => x.id === id);
          return p ? { id: p.id, name: p.name } : null;
        })
        .filter(Boolean);

      const payload = {
        userId,
        title: formData.title,
        description: formData.description,
        startDate,
        endDate,
        treatments: selectedTreatments,
        products: selectedProducts,
      };

      if (program?.id) {
        await updateProgram({ id: program.id, ...payload });
      } else {
        await createProgram(payload);
      }

      // Notify the client by email (non-blocking)
      (async () => {
        try {
          const client = await getUserById(userId);
          const to = client?.email;
          if (!to) return;
          const isUpdate = Boolean(program?.id);
          const startStr = formData.start_date ? formData.start_date.split('-').reverse().join('/') : '-';
          const endStr = formData.end_date ? formData.end_date.split('-').reverse().join('/') : '-';
          const treatmentsList = (payload.treatments || []).map(t => `- ${t.name}`).join('\n');
          const productsList = (payload.products || []).filter(p => p.id !== 'none').map(p => `- ${p.name}`).join('\n');
          const subject = `${isUpdate ? 'Mise à jour de votre programme' : 'Votre nouveau programme'} - ${formData.title}`;
          const text = `Bonjour ${client?.name || ''},\n\n${isUpdate ? 'Votre programme a été mis à jour.' : 'Un nouveau programme a été créé pour vous.'}\n\nTitre: ${formData.title}\nDescription: ${formData.description}\nDébut: ${startStr}\nFin: ${endStr}\n\nTraitements:\n${treatmentsList || '-'}\n\nProduits:\n${productsList || '-'}\n\nÀ bientôt,\nPlasmaCare`;
          const html = `
            <p>Bonjour ${client?.name || ''},</p>
            <p>${isUpdate ? 'Votre programme a été mis à jour.' : 'Un nouveau programme a été créé pour vous.'}</p>
            <ul>
              <li><strong>Titre:</strong> ${formData.title}</li>
              <li><strong>Description:</strong> ${formData.description}</li>
              <li><strong>Début:</strong> ${startStr}</li>
              <li><strong>Fin:</strong> ${endStr}</li>
            </ul>
            <p><strong>Traitements:</strong></p>
            <ul>
              ${(payload.treatments || []).map(t => `<li>${t.name}</li>`).join('') || '<li>-</li>'}
            </ul>
            <p><strong>Produits:</strong></p>
            <ul>
              ${(payload.products || []).filter(p => p.id !== 'none').map(p => `<li>${p.name}</li>`).join('') || '<li>-</li>'}
            </ul>
            <p>À bientôt,<br/>PlasmaCare</p>
          `;
          await sendEmail({ to, subject, text, html });
        } catch (err) {
          console.error('Erreur lors de l\'envoi de l\'email client (programme):', err);
        }
      })();

      onClose();
    } catch (error) {
      console.error('Erreur:', error);
      alert(error?.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={program ? 'Modifier le programme' : 'Nouveau programme'}
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-4">{error}</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Titre
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="input"
            placeholder="Titre du programme"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input min-h-[100px]"
            placeholder="Description du programme"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date de début
          </label>
          <input
            type="date"
            required
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            className="input"
            min={todayStr}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date de fin
          </label>
          <input
            type="date"
            required
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            className="input"
            min={formData.start_date || todayStr}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Traitements
          </label>
          <select
            multiple
            required
            value={formData.treatment_ids}
            onChange={(e) => setFormData({
              ...formData,
              treatment_ids: Array.from(e.target.selectedOptions, option => option.value)
            })}
            className="input h-32"
          >
            {treatments?.map(treatment => (
              <option key={treatment.id} value={treatment.id}>
                {treatment.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Produits
          </label>
          <select
            multiple
            required
            value={formData.product_ids}
            onChange={(e) => setFormData({
              ...formData,
              product_ids: Array.from(e.target.selectedOptions, option => option.value)
            })}
            className="input h-32"
          >
            {products?.map(product => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? 'Enregistrement...' : (program ? 'Modifier' : 'Créer')}
          </button>
        </div>
      </form>
      )}
    </Dialog>
  );
}
