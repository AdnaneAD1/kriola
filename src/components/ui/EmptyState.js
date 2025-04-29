'use client'

import { FolderOpen, AlertCircle } from 'lucide-react';

export function EmptyState({ 
  title = 'Aucune donnée disponible', 
  description = 'Aucun élément à afficher pour le moment.', 
  icon: Icon = FolderOpen,
  actionLabel,
  onAction
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="btn-primary inline-flex items-center"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
