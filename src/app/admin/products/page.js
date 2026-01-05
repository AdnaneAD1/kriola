'use client'

import { useEffect, useState } from 'react';
import { Plus, Package } from 'lucide-react';
import { ProductForm } from '../../../components/forms/ProductForm';
import { DropdownMenu } from '../../../components/ui/DropdownMenu';
import { useProducts } from '@/hooks/useProducts';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingPage } from '@/components/ui/LoadingSpinner';

export default function AdminProducts() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const { products, error, deleteProduct, loading, subscribeToProducts } = useProducts();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Abonnement temps réel aux produits avec recherche
  useEffect(() => {
    const unsubscribe = subscribeToProducts({
      status: true,
      orderBy: 'name',
      orderDirection: 'asc',
      searchTerm: search?.trim() || undefined,
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [subscribeToProducts, search]);

  // Reset pagination when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Scroll to top when page changes
  useEffect(() => {
    document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  if (loading) {
    return <LoadingPage message="Chargement des produits..." />;
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

  const totalItems = (products || []).length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedProducts = (products || []).slice(startIndex, startIndex + pageSize);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold whitespace-nowrap">Gestion des produits</h1>
        <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="input w-full sm:w-64"
          />
          <button
            onClick={() => {
              setEditingProduct(null);
              setIsFormOpen(true);
            }}
            className="btn-primary w-full sm:w-auto"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouveau produit
          </button>
        </div>
      </div>

      {(products || []).length > 0 ? (
        <div className="grid gap-6">
          {paginatedProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm p-6">
              {/* Header avec titre et dropdown - Mobile */}
              <div className="flex items-center justify-between mb-4 lg:hidden">
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

              <div className="flex flex-col lg:flex-row gap-6">
                {/* Contenu principal */}
                <div className="flex-1">
                  {/* Header avec titre - Desktop seulement */}
                  <div className="hidden lg:flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.status ? 'Actif' : 'Inactif'}</p>
                    </div>
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

                {/* Image du produit - Desktop */}
                <div className="hidden lg:block lg:w-48 lg:flex-shrink-0">
                  {product.imageUrl ? (
                    <div className="relative h-40 w-full">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="hidden w-full h-full bg-gray-100 rounded-lg border border-gray-200 items-center justify-center">
                        <div className="text-center text-gray-400">
                          <Package className="w-8 h-8 mx-auto mb-2" />
                          <p className="text-xs">Image non disponible</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-40 w-full bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <Package className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-xs">Aucune image</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Dropdown - Desktop seulement */}
                <div className="hidden lg:flex lg:items-start lg:pt-4">
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
              </div>

              {/* Image du produit - Mobile */}
              <div className="mt-4 lg:hidden">
                {product.imageUrl ? (
                  <div className="relative h-32 w-full">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden w-full h-full bg-gray-100 rounded-lg border border-gray-200 items-center justify-center">
                      <div className="text-center text-gray-400">
                        <Package className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-xs">Image non disponible</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-32 w-full bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <Package className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-xs">Aucune image</p>
                    </div>
                  </div>
                )}
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
          icon={Package}
          title="Aucun produit"
          description="Il n'y a actuellement aucun produit dans le catalogue. Vous pouvez ajouter un nouveau produit en cliquant sur le bouton ci-dessous."
          actionLabel="Nouveau produit"
          onAction={() => {
            setEditingProduct(null);
            setIsFormOpen(true);
          }}
        />
      )}

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
