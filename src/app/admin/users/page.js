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

  // Subscribe to clients list with search term
  useEffect(() => {
    const unsubscribe = subscribeToUsers({
      role: 'client',
      orderBy: 'name',
      orderDirection: 'asc',
      searchTerm: search?.trim() || undefined,
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [subscribeToUsers, search]);

  const getStatusColor = (emailVerified) => {
    return emailVerified 
      ? 'bg-green-100 text-green-800'
      : 'bg-yellow-100 text-yellow-800';
  };

  const translateStatus = (emailVerified) => {
    return emailVerified ? 'Email vérifié' : 'Email non vérifié';
  };

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
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
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
            <button className="btn-secondary flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filtres
            </button>
            <button className="btn-secondary">
              Trier par
            </button>
          </div>
        </div>
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
              {users?.map((user) => (
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
                      {user.phone && (
                        <div className="flex items-center text-sm text-gray-600 break-all">
                          <Phone className="w-4 h-4 mr-2" />
                          {user.phone}
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

      {/* Users Cards - Mobile */}
      <div className="md:hidden space-y-4">
        {users?.map((user) => (
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
                {user.phone && (
                  <div className="flex items-center text-sm text-gray-600 break-all">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    {user.phone}
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
