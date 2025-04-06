'use client'

import { useState } from 'react';
import { Plus, Package } from 'lucide-react';
import { ProductForm } from '../../../components/forms/ProductForm';
import { DropdownMenu } from '../../../components/ui/DropdownMenu';

export default function AdminProducts() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const products = [
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

  const handleDelete = (productId) => {
    // Logique de suppression à implémenter
    console.log('Suppression du produit:', productId);
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
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.category}</p>
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
                  <span className="text-sm font-medium text-gray-700">Prix:</span>
                  <span className="ml-2 text-lg font-semibold text-primary">
                    {formatPrice(product.price)}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Stock:</span>
                  <span className={`
                    ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${product.stock > 10 
                      ? 'bg-green-100 text-green-800' 
                      : product.stock > 0 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }
                  `}>
                    {product.stock} unités
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
