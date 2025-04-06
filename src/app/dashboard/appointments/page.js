'use client'

import { useState } from 'react';
import { Calendar, Clock, Plus } from 'lucide-react';
import { AppointmentForm } from '../../../components/forms/AppointmentForm';

export default function Appointments() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [appointments] = useState([
    {
      id: 1,
      title: "Traitement Anti-âge",
      date: "15 Avril 2025",
      time: "14:30",
      status: "confirmed",
      practitioner: "Dr. Sophie Martin",
      location: "Cabinet Principal"
    },
    {
      id: 2,
      title: "Lifting Non-chirurgical",
      date: "22 Avril 2025",
      time: "10:00",
      status: "pending",
      practitioner: "Dr. Marie Dubois",
      location: "Cabinet Annexe"
    }
  ]);

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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mes rendez-vous</h1>
        <button
          onClick={() => setIsFormOpen(true)}
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
                      <span>{appointment.date}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{appointment.time}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium">{appointment.title}</h3>
                  </div>
                </div>
                <div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                    {translateStatus(appointment.status)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AppointmentForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </div>
  );
}
