'use client'

import { useState } from 'react';
import { Calendar, Clock, Plus, User } from 'lucide-react';
import { AdminAppointmentForm } from '../../../components/forms/AdminAppointmentForm';
import { DropdownMenu } from '../../../components/ui/DropdownMenu';

export default function AdminAppointments() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);

  const appointments = [
    {
      id: 1,
      date: '2024-04-15',
      time: '14:30',
      treatment: 'Rajeunissement du visage',
      client: {
        name: 'Sophie Martin',
        email: 'sophie.martin@email.com'
      },
      status: 'confirmed'
    },
    {
      id: 2,
      date: '2024-04-20',
      time: '10:00',
      treatment: 'Traitement de l\'acné',
      client: {
        name: 'Lucas Bernard',
        email: 'lucas.bernard@email.com'
      },
      status: 'pending'
    }
  ];

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
    setIsFormOpen(true);
  };

  const handleDelete = (appointmentId) => {
    // Logique de suppression à implémenter
    console.log('Suppression du rendez-vous:', appointmentId);
  };

  const handleCancel = (appointmentId) => {
    // Logique d'annulation à implémenter
    console.log('Annulation du rendez-vous:', appointmentId);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des rendez-vous</h1>
        <button
          onClick={() => {
            setEditingAppointment(null);
            setIsFormOpen(true);
          }}
          className="btn-primary"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouveau rendez-vous
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="grid divide-y">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{new Date(appointment.date).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{appointment.time}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{appointment.client.name}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium">{appointment.treatment}</h3>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`
                    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${appointment.status === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                    }
                  `}>
                    {appointment.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                  </span>
                  <DropdownMenu
                    items={[
                      {
                        label: 'Modifier',
                        onClick: () => handleEdit(appointment)
                      },
                      {
                        label: 'Annuler le rendez-vous',
                        onClick: () => handleCancel(appointment.id),
                        destructive: true
                      },
                      {
                        label: 'Supprimer',
                        onClick: () => handleDelete(appointment.id),
                        destructive: true
                      }
                    ]}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AdminAppointmentForm 
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingAppointment(null);
        }}
        appointment={editingAppointment}
      />
    </div>
  );
}
