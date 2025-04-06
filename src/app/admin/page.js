'use client'

import { Users, Calendar, TrendingUp, FileText, Package } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const stats = [
    {
      id: 1,
      name: 'Clients actifs',
      value: '521',
      change: '+5%',
      changeType: 'increase',
      icon: Users
    },
    {
      id: 2,
      name: 'Rendez-vous aujourd\'hui',
      value: '12',
      change: '+2',
      changeType: 'increase',
      icon: Calendar
    },
    {
      id: 3,
      name: 'Taux de conversion',
      value: '24.57%',
      change: '+2.5%',
      changeType: 'increase',
      icon: TrendingUp
    },
    {
      id: 4,
      name: 'Traitements en cours',
      value: '18',
      change: '-3',
      changeType: 'decrease',
      icon: FileText
    }
  ];

  const recentAppointments = [
    {
      id: 1,
      client: 'Marie Dupont',
      treatment: 'Traitement Anti-âge',
      date: '15 Avril 2025',
      time: '14:30',
      status: 'confirmed'
    },
    {
      id: 2,
      client: 'Sophie Martin',
      treatment: 'Lifting Non-chirurgical',
      date: '15 Avril 2025',
      time: '15:45',
      status: 'pending'
    },
    {
      id: 3,
      client: 'Julie Lambert',
      treatment: 'Soin Éclaircissant',
      date: '15 Avril 2025',
      time: '16:30',
      status: 'cancelled'
    }
  ];

  const popularTreatments = [
    {
      id: 1,
      name: 'Traitement Anti-âge',
      bookings: 45,
      growth: '+12%',
      revenue: '11,250€'
    },
    {
      id: 2,
      name: 'Lifting Non-chirurgical',
      bookings: 32,
      growth: '+8%',
      revenue: '6,400€'
    },
    {
      id: 3,
      name: 'Soin Éclaircissant',
      bookings: 28,
      growth: '+15%',
      revenue: '4,200€'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const translateStatus = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmé';
      case 'pending':
        return 'En attente';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <button className="btn-primary">
            Nouveau rendez-vous
          </button>
          <button className="btn-secondary">
            Exporter les données
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <span className={`text-sm font-medium ${
                stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
            <p className="text-gray-600">{stat.name}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Rendez-vous du jour</h2>
              <Link href="/admin/appointments" className="text-primary hover:text-primary/80">
                Voir tout
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {recentAppointments.map((appointment) => (
              <div key={appointment.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Calendar className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium">{appointment.client}</p>
                      <p className="text-sm text-gray-500">
                        {appointment.treatment}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-gray-500">
                      {appointment.time}
                    </p>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {translateStatus(appointment.status)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Treatments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Traitements populaires</h2>
              <Link href="/admin/treatments" className="text-primary hover:text-primary/80">
                Voir tout
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {popularTreatments.map((treatment) => (
              <div key={treatment.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium">{treatment.name}</p>
                      <p className="text-sm text-gray-500">
                        {treatment.bookings} réservations
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{treatment.revenue}</p>
                    <p className="text-sm text-green-600">
                      {treatment.growth}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
