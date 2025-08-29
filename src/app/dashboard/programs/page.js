'use client'

import { Package, Calendar, Clock, CheckCircle2, CircleDot } from 'lucide-react'
import { usePrograms } from '@/hooks/usePrograms'
import { useUsers } from '@/hooks/useUsers'
import { useEffect } from 'react'
import { EmptyState } from '@/components/ui/EmptyState'

export default function Programs() {
  const { currentUser } = useUsers()
  const { programs, loading, error, subscribeToPrograms } = usePrograms()

  useEffect(() => {
    if (!currentUser?.id) return
    const unsub = subscribeToPrograms({ userId: currentUser.id, orderBy: 'startDate', orderDirection: 'desc' })
    return () => {
      if (typeof unsub === 'function') unsub()
    }
  }, [currentUser?.id, subscribeToPrograms])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Mes programmes</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : programs.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Aucun programme"
          description="Vous n'avez pas encore de programme actif. Revenez plus tard."
        />
      ) : (
        <div className="grid gap-4">
          {programs.map((p) => (
            <div key={p.id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold">{p.title}</h3>
                  <p className="text-sm text-gray-600">{p.description}</p>
                  <div className="text-xs text-gray-500 flex gap-3">
                    <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3"/> {p.startDate ? new Date(p.startDate).toLocaleDateString('fr-FR') : '-'}</span>
                    {p.endDate && <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3"/> {new Date(p.endDate).toLocaleDateString('fr-FR')}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {p.status === 'completed' ? <CheckCircle2 className="w-4 h-4"/> : <CircleDot className="w-4 h-4"/>}
                    {p.status}
                  </span>
                </div>
              </div>
              {Array.isArray(p.treatments) && p.treatments.length > 0 && (
                <div className="divide-y divide-gray-100 mt-3">
                  {p.treatments.map((treatment) => (
                    <div key={treatment.id} className="p-3 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {treatment.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <CircleDot className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{treatment.name}</p>
                          <p className="text-sm text-gray-500">
                            {treatment.duration ? `${treatment.duration} minutes` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {treatment.startDate ? new Date(treatment.startDate).toLocaleDateString('fr-FR') : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {programs.length === 0 && (
            <EmptyState
              icon={Package}
              title="Aucun programme"
              description="Vous n'avez aucun programme de traitement actif pour le moment. Vos programmes personnalisés apparaîtront ici après votre consultation."
            />
          )}
        </div>
      )}
    </div>
  )
}
