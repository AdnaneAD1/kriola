'use client'

import { Search, Filter, MoreVertical, Mail, Phone, User } from 'lucide-react';
import Link from 'next/link';
import { useUsers } from '@/hooks/useUsers';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useEffect, useState } from 'react';

export default function Users() {
  const { users, loading, subscribeToUsers } = useUsers();
  const [activeMenu, setActiveMenu] = useState(null);
  const [search, setSearch] = useState('');
  
  // États pour les filtres
  const [statusFilter, setStatusFilter] = useState('all'); // all | verified | unverified
  const [sortBy, setSortBy] = useState('name'); // name | date | email
  const [sortOrder, setSortOrder] = useState('asc'); // asc | desc
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Subscribe to clients list
  useEffect(() => {
    const unsubscribe = subscribeToUsers({
      role: 'client',
      orderBy: 'name',
      orderDirection: 'asc',
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [subscribeToUsers]);
  
  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, sortBy, sortOrder, dateFrom, dateTo]);

  const getStatusColor = (emailVerified) => {
    return emailVerified 
      ? 'bg-green-100 text-green-800'
      : 'bg-yellow-100 text-yellow-800';
  };

  const translateStatus = (emailVerified) => {
    return emailVerified ? 'Email vérifié' : 'Email non vérifié';
  };
  
  // Fonction de filtrage et tri
  const getFilteredAndSortedUsers = () => {
    if (!users) return [];
    
    let filtered = users.filter(user => {
      // Filtre par recherche
      if (search.trim()) {
        const searchTerm = search.toLowerCase();
        const matchesName = user.name?.toLowerCase().includes(searchTerm);
        const matchesEmail = user.email?.toLowerCase().includes(searchTerm);
        const matchesPhone = user.phoneNumber?.toLowerCase().includes(searchTerm);
        if (!matchesName && !matchesEmail && !matchesPhone) return false;
      }
      
      // Filtre par statut email
      if (statusFilter === 'verified' && !user.emailVerified) return false;
      if (statusFilter === 'unverified' && user.emailVerified) return false;
      
      // Filtre par date d'inscription
      const userDate = new Date(user.createdAt || user.created_at);
      if (dateFrom) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        if (userDate < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        if (userDate > to) return false;
      }
      
      return true;
    });
    
    // Tri
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name?.toLowerCase() || '';
          bValue = b.name?.toLowerCase() || '';
          break;
        case 'email':
          aValue = a.email?.toLowerCase() || '';
          bValue = b.email?.toLowerCase() || '';
          break;
        case 'date':
          aValue = new Date(a.createdAt || a.created_at).getTime();
          bValue = new Date(b.createdAt || b.created_at).getTime();
          break;
        default:
          return 0;
      }
      
      if (sortBy === 'date') {
        return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
      } else {
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      }
    });
    
    return filtered;
  };
  
  const filteredUsers = getFilteredAndSortedUsers();
  
  // Pagination
  const totalItems = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Utilisateurs</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  className="input pl-10 w-full"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                className={`btn-secondary flex items-center gap-2 rounded-lg px-4 py-2 ${
                  showFilters ? 'bg-primary text-white' : ''
                }`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4" />
                Filtres
              </button>
            </div>
          </div>
        </div>
        
        {/* Filtres avancés */}
        {showFilters && (
          <div className="border-t border-gray-100 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Statut email</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input w-full"
                >
                  <option value="all">Tous</option>
                  <option value="verified">Email vérifié</option>
                  <option value="unverified">Email non vérifié</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Trier par</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input w-full"
                >
                  <option value="name">Nom</option>
                  <option value="email">Email</option>
                  <option value="date">Date d'inscription</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Ordre</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="input w-full"
                >
                  <option value="asc">{sortBy === 'date' ? 'Plus ancien' : 'A-Z'}</option>
                  <option value="desc">{sortBy === 'date' ? 'Plus récent' : 'Z-A'}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Inscrit du</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="input w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Au</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="input w-full"
                />
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('all');
                    setSortBy('name');
                    setSortOrder('asc');
                    setDateFrom('');
                    setDateTo('');
                  }}
                  className="btn-secondary w-full"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              {filteredUsers.length} utilisateur(s) trouvé(s)
            </div>
          </div>
        )}
      </div>

      {/* Users Table - Desktop */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Nom</th>
                <th className="hidden lg:table-cell text-left py-4 px-6 text-sm font-medium text-gray-600">Contact</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Statut</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Date d'inscription</th>
                <th className="py-4 px-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedUsers?.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-medium">
                          {user.name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500 break-all">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden lg:table-cell py-4 px-6">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-600 break-all">
                        <Mail className="w-4 h-4 mr-2" />
                        {user.email}
                      </div>
                      {user.phoneNumber && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="w-4 h-4 mr-2" />
                          {user.phoneNumber}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(user.emailVerified)}`}>
                      {translateStatus(user.emailVerified)}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {(() => {
                      const created = user?.createdAt || user?.created_at;
                      return created ? format(new Date(created), 'dd MMMM yyyy', { locale: fr }) : '—';
                    })()}
                  </td>
                  <td className="py-4 px-6 relative">
                    <button 
                      className="p-2 hover:bg-gray-100 rounded-lg"
                      onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)}
                    >
                      <MoreVertical className="w-5 h-5 text-gray-400" />
                    </button>
                    {activeMenu === user.id && (
                      <div 
                        className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-10"
                        onClick={() => setActiveMenu(null)}
                      >
                        <Link 
                          href={`/admin/users/${user.id}`}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                        >
                          Voir plus de détails
                        </Link>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="px-3 py-2 rounded-md border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <span className="text-sm text-gray-600">
              Page {safePage} sur {totalPages} ({totalItems} utilisateurs)
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="px-3 py-2 rounded-md border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        </div>
      )}

      {/* Users Cards - Mobile */}
      <div className="md:hidden space-y-4">
        {paginatedUsers?.map((user) => (
          <div key={user.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-medium">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500 break-all">{user.email}</p>
                  </div>
                </div>
                <div className="relative">
                  <button 
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)}
                  >
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                  </button>
                  {activeMenu === user.id && (
                    <div 
                      className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-10"
                      onClick={() => setActiveMenu(null)}
                    >
                      <Link 
                        href={`/admin/users/${user.id}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                      >
                        Voir plus de détails
                      </Link>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 border-t border-gray-100 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Statut</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(user.emailVerified)}`}>
                    {translateStatus(user.emailVerified)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Date d'inscription</span>
                  <span className="text-sm text-gray-600">
                    {(() => {
                      const created = user?.createdAt || user?.created_at;
                      return created ? format(new Date(created), 'dd MMM yyyy', { locale: fr }) : '—';
                    })()}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600 mt-2 break-all">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  {user.email}
                </div>
                {user.phoneNumber && (
                  <div className="flex items-center text-sm text-gray-600 break-all">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    {user.phoneNumber}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
