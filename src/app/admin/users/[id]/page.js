'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
// Firebase hooks
import { useAppointments } from '@/hooks/useAppointments'
import { useDiagnoses } from '@/hooks/useDiagnoses'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Mail, Phone, Calendar, FileText, Activity, Plus, Edit2, Trash2 } from 'lucide-react'
import { usePrograms } from '@/hooks/usePrograms'
import { AdminProgramForm } from '@/components/forms/AdminProgramForm'
import { AdminDiagnosisForm } from '@/components/forms/AdminDiagnosisForm'
import { useUsers } from '@/hooks/useUsers'

export default function UserDetails() {
  const params = useParams()
  const router = useRouter()
  const { getUserById, deleteUserDeep } = useUsers()
  const { getAppointments } = useAppointments()
  const { getUserDiagnoses } = useDiagnoses()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState([])
  const [diagnoses, setDiagnoses] = useState([])
  const [isProgramFormOpen, setIsProgramFormOpen] = useState(false)
  const [editingProgram, setEditingProgram] = useState(null)
  const [isDiagnosisFormOpen, setIsDiagnosisFormOpen] = useState(false)
  const [editingDiagnosis, setEditingDiagnosis] = useState(null)

  const { programs, loading: isProgramsLoading, error: programsError, subscribeToPrograms, deleteProgram } = usePrograms()

  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true)
        const [u, appts, diags] = await Promise.all([
          getUserById(params.id),
          getAppointments({ userId: params.id, orderBy: 'date', orderDirection: 'desc' }),
          getUserDiagnoses(params.id),
        ])
        setUser(u)
        setAppointments(appts || [])
        setDiagnoses(diags || [])
      } finally {
        setLoading(false)
      }
    }
    loadAll()
    const unsubscribe = subscribeToPrograms({ userId: params.id, orderBy: 'startDate', orderDirection: 'desc' })
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe()
    }
  }, [params.id, getUserById, getAppointments, getUserDiagnoses, subscribeToPrograms])

  // Ensure newest -> oldest rendering order in UI
  const sortedAppointments = useMemo(() => {
    return (appointments || []).slice().sort((a, b) => {
      const aTime = new Date(a?.date || a?.start_time || 0).getTime()
      const bTime = new Date(b?.date || b?.start_time || 0).getTime()
      return bTime - aTime
    })
  }, [appointments])

  const sortedDiagnoses = useMemo(() => {
    return (diagnoses || []).slice().sort((a, b) => {
      const aTime = new Date(a?.date || 0).getTime()
      const bTime = new Date(b?.date || 0).getTime()
      return bTime - aTime
    })
  }, [diagnoses])

  const sortedPrograms = useMemo(() => {
    return (programs || []).slice().sort((a, b) => {
      const aTime = new Date(a?.startDate || 0).getTime()
      const bTime = new Date(b?.startDate || 0).getTime()
      return bTime - aTime
    })
  }, [programs])

  if (loading || isProgramsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Détails de l&apos;utilisateur</h1>
        {/* <button
          onClick={async () => {
            if (confirm("Êtes-vous sûr de vouloir supprimer définitivement cet utilisateur et toutes ses données ?")) {
              try {
                await deleteUserDeep(params.id)
                router.push('/admin/users')
              } catch (e) {
                console.error('Erreur lors de la suppression utilisateur:', e)
                alert("Une erreur est survenue lors de la suppression de l'utilisateur.")
              }
            }
          }}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
        >
          <Trash2 className="w-4 h-4 mr-2" /> Supprimer l&apos;utilisateur
        </button> */}
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-wrap items-start gap-4">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-primary text-xl font-medium">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-primary">{user?.name}</h2>
            <div className="mt-4 space-y-2">
              <div className="flex items-center text-gray-600 min-w-0 break-words">
                <Mail className="w-5 h-5 mr-2" />
                {user?.email}
              </div>
              {user?.phone && (
                <div className="flex items-center text-gray-600 min-w-0 break-words">
                  <Phone className="w-5 h-5 mr-2" />
                  {user?.phone}
                </div>
              )}
              <div className="flex items-center text-gray-600 min-w-0 break-words">
                <Calendar className="w-5 h-5 mr-2" />
                {(() => {
                  const created = user?.createdAt || user?.created_at;
                  return (
                    <>Inscrit le {created ? format(new Date(created), 'dd MMMM yyyy', { locale: fr }) : '—'}</>
                  );
                })()}
              </div>
            </div>
          </div>
          {/* <div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              user?.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {user?.status === 'active' ? 'Actif' : 'Inactif'}
            </span>
          </div> */}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appointments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4 text-primary">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Rendez-vous
            </h3>
            <span className="text-sm text-gray-500">{appointments?.length || 0} total</span>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
            {sortedAppointments.map((appointment) => (
              <div key={appointment.id} className="p-4 rounded-lg bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{appointment?.title || appointment?.treatment?.name || 'Rendez-vous'}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {format(new Date(appointment?.date || appointment?.start_time), 'dd MMMM yyyy HH:mm', { locale: fr })}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    appointment.status === 'confirmed' 
                      ? 'bg-green-100 text-green-800' 
                      : appointment.status === 'cancelled' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {appointment.status === 'confirmed' 
                      ? 'Confirmé' 
                      : appointment.status === 'cancelled' 
                        ? 'Annulé' 
                        : 'En attente'}
                  </div>
                </div>
                {appointment.category && (
                  <div className="text-sm text-gray-600 mt-2">
                    Catégorie : {appointment.category}
                  </div>
                )}
                {appointment.notes && (
                  <div className="text-sm text-gray-600 mt-2">
                    Notes : {appointment.notes}
                  </div>
                )}
              </div>
            ))}
            {(!appointments || appointments.length === 0) && (
              <p className="text-gray-500 text-sm">Aucun rendez-vous</p>
            )}
          </div>
        </div>

        {/* Diagnoses */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4 text-primary">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Diagnostiques
            </h3>
            <span className="text-sm text-gray-500">{diagnoses?.length || 0} total</span>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
            {sortedDiagnoses.map((diagnosis) => (
              <div key={diagnosis.id} className="p-4 rounded-lg bg-gray-50 space-y-3">
                <div>
                  <div className="font-medium">Diagnostic du {format(new Date(diagnosis.date), 'dd MMMM yyyy', { locale: fr })}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Type de peau : {diagnosis.skin_type || diagnosis.skinType}
                  </div>
                </div>

                {diagnosis.concerns && diagnosis.concerns.length > 0 && (
                  <div>
                    <div className="text-sm font-medium">Préoccupations :</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {diagnosis.concerns.map((concern, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                          {concern}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {diagnosis.treatments && diagnosis.treatments.length > 0 && (
                  <div>
                    <div className="text-sm font-medium">Traitements recommandés :</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {diagnosis.treatments.map((treatment, index) => {
                        const name = typeof treatment === 'string' ? treatment : treatment?.name
                        return (
                          <span key={index} className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">{name}</span>
                        )
                      })}
                    </div>
                  </div>
                )}

                {diagnosis.recommendations && (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Recommandations :</div>
                      <div className="text-sm text-gray-600 mt-1">{diagnosis.recommendations}</div>
                    </div>
                    <button
                      onClick={() => {
                        setEditingDiagnosis(diagnosis);
                        setIsDiagnosisFormOpen(true);
                      }}
                      className="p-2 text-gray-600 hover:text-gray-900"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {diagnosis.notes && (
                  <div>
                    <div className="text-sm font-medium">Notes :</div>
                    <div className="text-sm text-gray-600 mt-1">{diagnosis.notes}</div>
                  </div>
                )}

                {diagnosis.photos && diagnosis.photos.length > 0 && (
                  <div>
                    <div className="text-sm font-medium">Photos :</div>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {diagnosis.photos.map((photo, index) => {
                        const url = typeof photo === 'string' ? photo : photo?.url
                        return (
                          <img key={index} src={url} alt={`Photo ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {(!diagnoses || diagnoses.length === 0) && (
              <p className="text-gray-500 text-sm">Aucun diagnostique</p>
            )}
          </div>
        </div>

        {/* Programs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-primary mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Programmes
            </h3>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  setEditingProgram(null);
                  setIsProgramFormOpen(true);
                }}
                className="btn-primary w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouveau programme
              </button>
            </div>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
            {sortedPrograms.map((program) => (
              <div key={program.id} className="p-4 rounded-lg bg-gray-50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{program.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{program.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>Du {format(new Date(program.startDate), 'dd MMMM yyyy', { locale: fr })}</span>
                      <span>au {program.endDate ? format(new Date(program.endDate), 'dd MMMM yyyy', { locale: fr }) : '—'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingProgram(program);
                        setIsProgramFormOpen(true);
                      }}
                      className="p-2 text-gray-600 hover:text-gray-900"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Êtes-vous sûr de vouloir supprimer ce programme ?')) {
                          deleteProgram(program.id);
                        }
                      }}
                      className="p-2 text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                  <div>
                    <h5 className="text-sm font-medium mb-2">Traitements</h5>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {program.treatments?.map(treatment => (
                        <li key={treatment.id}>{treatment.name}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium mb-2">Produits</h5>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {program.products?.map(product => (
                        <li key={product.id}>{product.name}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
            {(!programs || programs.length === 0) && (
              <p className="text-gray-500 text-sm">Aucun programme</p>
            )}
          </div>
        </div>
      </div>

      <AdminDiagnosisForm
        isOpen={isDiagnosisFormOpen}
        onClose={() => {
          setIsDiagnosisFormOpen(false);
          setEditingDiagnosis(null);
        }}
        diagnosis={editingDiagnosis}
      />

      <AdminProgramForm
        isOpen={isProgramFormOpen}
        onClose={() => {
          setIsProgramFormOpen(false);
          setEditingProgram(null);
        }}
        userId={params.id}
        program={editingProgram}
      />
    </div>
  )
}
