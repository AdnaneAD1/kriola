'use client'

import { useState, useEffect } from 'react';
import { Image, X } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';

export function ProductForm({ isOpen, onClose, product = null }) {
  const { createProduct, updateProduct } = useProducts();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    posology: '',
    image: null
  });



  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        posology: product.posology || '',
        image: null
      });
    } else {
      setFormData({
        name: '',
        description: '',
        posology: '',
        image: null
      });
    }
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('posology', formData.posology);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      if (product) {
        await updateProduct(product.id, formDataToSend);
      } else {
        await createProduct(formDataToSend);
      }
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Une erreur est survenue lors de la sauvegarde du produit.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col relative">
        <div className="p-6 border-b">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-semibold pr-8">
            {product ? `Modifier ${product.name}` : 'Nouveau produit'}
          </h2>
        </div>

        <div className="p-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <form onSubmit={handleSubmit} id="productForm" className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du produit
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                placeholder="Nom du produit..."
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
                placeholder="Description du produit..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Posologie
              </label>
              <textarea
                required
                value={formData.posology}
                onChange={(e) => setFormData({ ...formData, posology: e.target.value })}
                className="input min-h-[100px]"
                placeholder="Posologie du produit..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  <Image className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                    >
                      <span>Télécharger une image</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG jusqu'à 10MB</p>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t bg-white">
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Annuler
            </button>
            <button
              type="submit"
              form="productForm"
              className="btn-primary"
            >
              {product ? 'Enregistrer les modifications' : 'Créer le produit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
