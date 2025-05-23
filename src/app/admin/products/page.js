'use client'

import { useState } from 'react';
import { Plus, Package } from 'lucide-react';
import { ProductForm } from '../../../components/forms/ProductForm';
import { DropdownMenu } from '../../../components/ui/DropdownMenu';
import { useProducts } from '@/hooks/useProducts';

export default function AdminProducts() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const { products, error, deleteProduct, isLoading } = useProducts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Chargement des produits...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Une erreur est survenue lors du chargement des produits.</div>
      </div>
    );
  }

  const mockProducts = [
    {
      id: 1,
      name: 'Crème Hydratante Premium',
      price: 49.99,
      stock: 15,
      category: 'Soins hydratants',
      description: 'Une crème hydratante enrichie en acide hyaluronique pour une hydratation intense.'
    },
    {
      id: 2,
      name: 'Sérum Anti-âge',
      price: 89.99,
      stock: 8,
      category: 'Anti-âge',
      description: 'Un sérum concentré qui combat efficacement les signes du vieillissement.'
    }
  ];

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDelete = async (productId) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await deleteProduct(productId);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Une erreur est survenue lors de la suppression du produit.');
      }
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
        <h1 className="text-2xl font-bold">Gestion des produits</h1>
        <button
          onClick={() => {
            setEditingProduct(null);
            setIsFormOpen(true);
          }}
          className="btn-primary"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouveau produit
        </button>
      </div>

      <div className="grid gap-6">
        {(products || []).map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.status ? 'Actif' : 'Inactif'}</p>
                </div>
              </div>
              <DropdownMenu
                items={[
                  {
                    label: 'Modifier',
                    onClick: () => handleEdit(product)
                  },
                  {
                    label: 'Supprimer',
                    onClick: () => handleDelete(product.id),
                    destructive: true
                  }
                ]}
              />
            </div>

            <div className="grid gap-4">
              <p className="text-gray-600">{product.description}</p>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-700">Posologie:</span>
                  <span className="ml-2 text-gray-600">
                    {product.posology}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ProductForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
      />
    </div>
  );
}
