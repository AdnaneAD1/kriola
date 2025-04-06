'use client'

import { useState } from 'react';
import { Search, Filter, MoreVertical, Mail, Phone, MapPin } from 'lucide-react';

export default function Users() {
  const [users] = useState([
    {
      id: 1,
      name: 'Marie Dupont',
      email: 'marie.dupont@example.com',
      phone: '06 12 34 56 78',
      location: 'Paris, France',
      status: 'active',
      lastVisit: '15 Avril 2025',
      treatments: ['Anti-âge', 'Lifting']
    },
    {
      id: 2,
      name: 'Sophie Martin',
      email: 'sophie.martin@example.com',
      phone: '06 23 45 67 89',
      location: 'Lyon, France',
      status: 'inactive',
      lastVisit: '10 Avril 2025',
      treatments: ['Éclaircissant']
    },
    {
      id: 3,
      name: 'Julie Lambert',
      email: 'julie.lambert@example.com',
      phone: '06 34 56 78 90',
      location: 'Marseille, France',
      status: 'active',
      lastVisit: '12 Avril 2025',
      treatments: ['Anti-âge']
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const translateStatus = (status) => {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'inactive':
        return 'Inactif';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Utilisateurs</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <button className="btn-primary">
            Ajouter un utilisateur
          </button>
          <button className="btn-secondary">
            Exporter
          </button>
        </div>
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

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Nom</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Contact</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Localisation</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Statut</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Dernière visite</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Traitements</th>
                <th className="py-4 px-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-medium">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        {user.phone}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {user.location}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {translateStatus(user.status)}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {user.lastVisit}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-1">
                      {user.treatments.map((treatment, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
                        >
                          {treatment}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <MoreVertical className="w-5 h-5 text-gray-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
