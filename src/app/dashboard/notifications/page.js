'use client'

import { useState } from 'react';
import { Bell, Calendar, FileText, MessageCircle } from 'lucide-react';

export default function Notifications() {
  const [notifications] = useState([
    {
      id: 1,
      type: 'appointment',
      title: 'Nouveau rendez-vous confirmé',
      message: 'Votre rendez-vous pour le traitement Anti-âge a été confirmé.',
      date: '6 Avril 2025',
      time: '10:30',
      read: false
    },
    {
      id: 2,
      type: 'diagnosis',
      title: 'Résultats de diagnostic disponibles',
      message: 'Les résultats de votre dernier diagnostic sont disponibles.',
      date: '5 Avril 2025',
      time: '15:45',
      read: true
    },
    {
      id: 3,
      type: 'message',
      title: 'Nouveau message',
      message: 'Dr. Sophie Martin vous a envoyé un message concernant votre traitement.',
      date: '4 Avril 2025',
      time: '09:15',
      read: false
    }
  ]);

  const getIcon = (type) => {
    switch (type) {
      case 'appointment':
        return Calendar;
      case 'diagnosis':
        return FileText;
      case 'message':
        return MessageCircle;
      default:
        return Bell;
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'appointment':
        return 'text-blue-500';
      case 'diagnosis':
        return 'text-purple-500';
      case 'message':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <button className="text-sm text-primary hover:text-primary/80">
          Tout marquer comme lu
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
        {notifications.map((notification) => {
          const Icon = getIcon(notification.type);
          return (
            <div 
              key={notification.id} 
              className={`p-6 flex items-start gap-4 ${!notification.read ? 'bg-primary/5' : ''}`}
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-opacity-10 flex items-center justify-center ${getIconColor(notification.type)} bg-current`}>
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm text-gray-500">{notification.date}</p>
                    <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
