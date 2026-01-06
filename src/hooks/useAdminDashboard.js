import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

// Helpers moved to module scope
const safeToDate = (v) => {
  try {
    if (!v) return null;
    if (v?.toDate) return v.toDate();
    if (typeof v === 'string' || typeof v === 'number') return new Date(v);
    if (v instanceof Date) return v;
    return null;
  } catch {
    return null;
  }
};

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const endOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
const startOfWeek = (d) => {
  const day = d.getDay(); // 0=Sun
  const diff = (day === 0 ? -6 : 1) - day; // Start on Monday
  const start = new Date(d);
  start.setDate(d.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  return start;
};
const endOfWeek = (d) => {
  const start = startOfWeek(d);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
};
const sameMonth = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

export function useAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load collections
      const [usersSnap, apptsSnap, treatmentsSnap, programsSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'appointments')),
        getDocs(collection(db, 'treatments')),
        getDocs(collection(db, 'programs')),
      ]);

      // Users map and clients list
      const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const usersById = new Map(users.map(u => [u.id, u]));
      const clientRoles = new Set(['client', 'patient']);
      const clients = users.filter(u => clientRoles.has((u.role || '').toLowerCase()));

      // Treatments map
      const treatments = treatmentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const treatmentById = new Map(treatments.map(t => [t.id, t]));

      // Appointments with normalized dates
      const appointments = apptsSnap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          date: safeToDate(data?.date),
        };
      }).filter(a => !!a.date);

      const now = new Date();
      const todayStart = startOfDay(now);
      const todayEnd = endOfDay(now);
      const weekStart = startOfWeek(now);
      const weekEnd = endOfWeek(now);

      // Normalize programs
      const programs = programsSnap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          startDate: safeToDate(data?.startDate),
          endDate: safeToDate(data?.endDate),
          userId: data?.userId,
          treatments: Array.isArray(data?.treatments) ? data.treatments : [],
        };
      });

      // Appointments stats
      const apptTotal = appointments.length;
      const apptToday = appointments.filter(a => a.date >= todayStart && a.date <= todayEnd).length;
      const apptThisWeek = appointments.filter(a => a.date >= weekStart && a.date <= weekEnd).length;
      const apptThisMonth = appointments.filter(a => sameMonth(a.date, now)).length;
      const byStatusCounts = appointments.reduce((acc, a) => {
        const s = a.status || 'pending';
        acc[s] = (acc[s] || 0) + 1;
        return acc;
      }, {});
      const byStatus = Object.keys(byStatusCounts).map(k => ({ status: k, count: byStatusCounts[k] }));

      // Clients stats
      const programUserIds = new Set(programs.map(p => p.userId).filter(Boolean));
      const clientUserIds = new Set(clients.map(c => c.id));
      const clientsWithPrograms = Array.from(programUserIds).filter(uid => clientUserIds.has(uid)).length;

      const clientsStats = {
        total: clients.length,
        newThisMonth: clients.filter(c => c.createdAt && sameMonth(safeToDate(c.createdAt), now)).length,
        withPrograms: clientsWithPrograms,
        withAppointments: new Set(appointments.map(a => a.userId)).size,
      };

      // Treatments stats
      const treatmentsStats = {
        total: treatments.length,
        byCategory: Object.entries(
          treatments.reduce((acc, t) => {
            const cat = t.category || 'Autre';
            acc[cat] = (acc[cat] || 0) + 1;
            return acc;
          }, {})
        ).map(([category, count]) => ({ category, count })),
        mostBooked: (() => {
          // Compter uniquement les rendez-vous confirmés ou complétés pour les traitements populaires
          const validStatuses = ['confirmed', 'completed'];
          const counts = appointments
            .filter(a => validStatuses.includes((a.status || '').toLowerCase()))
            .reduce((acc, a) => {
              // Support pour plusieurs traitements par rendez-vous
              if (Array.isArray(a.treatment_ids) && a.treatment_ids.length > 0) {
                a.treatment_ids.forEach(tId => {
                  const name = treatmentById.get(tId)?.name || 'Traitement';
                  acc[name] = (acc[name] || 0) + 1;
                });
              } else {
                // Support legacy: un seul traitement
                const tId = a.treatmentId || a.treatment_id;
                const name = tId ? (treatmentById.get(tId)?.name || 'Traitement') : (a.treatment || a.title || 'Traitement');
                acc[name] = (acc[name] || 0) + 1;
              }
              return acc;
            }, {});
          
          return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));
        })(),
        revenueFromAppointments: appointments
          .filter(a => (a.status || '').toLowerCase() === 'confirmed')
          .reduce((sum, a) => {
            // 1) Prefer explicit total_price saved on the appointment
            const totalPrice = Number(a.total_price);
            if (!Number.isNaN(totalPrice) && totalPrice > 0) {
              return sum + totalPrice;
            }

            // 2) If multiple treatments are attached
            if (Array.isArray(a.treatment_ids) && a.treatment_ids.length > 0) {
              const sub = a.treatment_ids.reduce((acc, id) => {
                const p = Number(treatmentById.get(id)?.price || 0);
                return acc + (Number.isNaN(p) ? 0 : p);
              }, 0);
              return sum + sub;
            }

            // 3) Fallback: legacy single treatment reference or embedded treatment id
            const tId = a.treatmentId || a.treatment_id || a.treatment?.id; // support legacy/embedded
            const price = tId ? Number(treatmentById.get(tId)?.price || 0) : 0;
            return sum + (Number.isNaN(price) ? 0 : price);
          }, 0),
        revenueFromPrograms: (() => {
          // Sum of treatment prices included in all programs
          // Each program.treatments contains items like {id, name}. Use treatmentById to get price.
          try {
            return programs.reduce((sum, p) => {
              const tTotal = (p.treatments || []).reduce((acc, item) => {
                const tId = item?.id;
                const price = tId ? Number(treatmentById.get(tId)?.price || 0) : 0;
                return acc + (isNaN(price) ? 0 : price);
              }, 0);
              return sum + tTotal;
            }, 0);
          } catch {
            return 0;
          }
        })(),
      };

      // Programs stats
      const programsStats = (() => {
        const total = programs.length;
        const nowDate = now;
        const in7d = new Date(nowDate);
        in7d.setDate(in7d.getDate() + 7);
        const active = programs.filter(p => p.endDate && p.endDate >= nowDate).length;
        const ending = programs.filter(p => p.endDate && p.endDate >= nowDate && p.endDate <= in7d).length;
        return { total, active, ending };
      })();

      // Upcoming appointments (next 5 starting today)
      const upcomingAppointments = appointments
        .filter(a => a.date >= todayStart)
        .sort((a,b) => a.date - b.date)
        .slice(0,5)
        .map(a => ({
          id: a.id,
          client_name: usersById.get(a.userId)?.name || 'Client',
          treatment: (() => {
            const tId = a.treatmentId || a.treatment_id;
            if (tId && treatmentById.get(tId)?.name) return treatmentById.get(tId).name;
            return a.treatment || a.title || 'Traitement';
          })(),
          date: a.date?.toISOString?.() || a.date,
          time: a.time || '',
          status: a.status || 'pending',
        }));

      // Recent clients (last 5 by createdAt)
      const recentClients = clients
        .map(c => ({
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phoneNumber || c.phone || null,
          created_at: c.createdAt || c.created_at || null,
        }))
        .sort((a,b) => {
          const da = safeToDate(a.created_at) || new Date(0);
          const db = safeToDate(b.created_at) || new Date(0);
          return db - da;
        })
        .slice(0,5);

      setStats({
        appointments: {
          total: apptTotal,
          today: apptToday,
          thisWeek: apptThisWeek,
          thisMonth: apptThisMonth,
          byStatus,
        },
        clients: clientsStats,
        treatments: treatmentsStats,
        programs: programsStats,
        upcomingAppointments,
        recentClients,
      });
    } catch (e) {
      setError(e?.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
}
