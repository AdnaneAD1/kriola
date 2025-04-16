'use client'

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { Dialog } from '@/components/ui/Dialog';

export function AdminProgramForm({ isOpen, onClose, userId, program }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    treatment_ids: [],
    product_ids: []
  });

  const [treatments, setTreatments] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (program) {
      setFormData({
        title: program.title || '',
        description: program.description || '',
        start_date: program.start_date || '',
        end_date: program.end_date || '',
        treatment_ids: program.treatments?.map(t => t.id) || [],
        product_ids: program.products?.map(p => p.id) || []
      });
    } else {
      setFormData({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        treatment_ids: [],
        product_ids: []
      });
    }
  }, [program]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [treatmentsRes, productsRes] = await Promise.all([
          axios.get('/api/treatments'),
          axios.get('/api/products')
        ]);
        setTreatments(treatmentsRes.data || []);
        setProducts(productsRes.data || []);
        setError(null);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setError('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      let result;
      
      if (program) {
        result = await axios.put(`/api/users/${userId}/programs/${program.id}`, formData);
      } else {
        result = await axios.post(`/api/users/${userId}/programs`, formData);
      }

      if (result.data) {
        onClose();
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert(error.response?.data?.message || 'Une erreur est survenue');
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
