'use client'

import { Package, Calendar, Clock, CheckCircle2, CircleDot } from 'lucide-react'
import { usePrograms } from '@/hooks/usePrograms'
import { useAuth } from '@/hooks/auth'
import { useEffect } from 'react'

export default function Programs() {
  const { user } = useAuth()
  const { programs, isLoading, error, fetchPrograms } = usePrograms(user?.id)

  useEffect(() => {
    if (user?.id) {
      fetchPrograms()
    }
  }, [user?.id])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Mes programmes</h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      ) : (
        <div className="grid gap-6">
          {programs?.map((program) => (
            <div key={program.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{program.name}</h3>
                      <div className="mt-2 space-y-2">
                        <p className="text-sm text-gray-500 flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          Du {program.start_date} au {program.end_date}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          {program.treatments_count} traitement{program.treatments_count > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    program.status === 'en cours' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {program.status}
                  </span>
                </div>
              </div>
              {program.treatments && (
                <div className="divide-y divide-gray-100">
                  {program.treatments.map((treatment) => (
                    <div key={treatment.id} className="p-4 flex items-center justify-between">
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
                            {treatment.duration} minutes
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {treatment.date}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {programs?.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Vous n'avez aucun programme actif pour le moment.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
