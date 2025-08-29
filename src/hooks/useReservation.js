import { useState, useCallback, useEffect } from 'react';
import { db, firebaseAuth } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export function useReservation() {
  // Source d'utilisateur: Firebase Auth uniquement (pas d'appel /api/user)
  const [authUser, setAuthUser] = useState(null);
  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, (u) => setAuthUser(u));
    return () => unsub();
  }, []);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState(null);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isCreatingReservation, setIsCreatingReservation] = useState(false);
  const [reservationError, setReservationError] = useState(null);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [isCreatingPaymentIntent, setIsCreatingPaymentIntent] = useState(false);
  const [paymentIntentError, setPaymentIntentError] = useState(null);

  /**
   * Récupère les créneaux disponibles pour une date et des traitements donnés
   * @param {string} date - Date au format YYYY-MM-DD
   * @param {Array} treatmentIds - Tableau des IDs des traitements sélectionnés
   */
  const getAvailableTimeSlots = useCallback(async (date, treatmentIds) => {
    if (!date || !treatmentIds || treatmentIds.length === 0) {
      setAvailableSlots([]);
      return;
    }

    setIsLoadingSlots(true);
    setSlotsError(null);

    try {
      // 1) Récupérer les traitements pour calculer la durée totale
      const treatmentsSnap = await getDocs(
        query(
          collection(db, 'treatments'),
          where('id', 'in', treatmentIds)
        )
      ).catch(async (e) => {
        // Si vos documents n'ont pas un champ "id" (id Firestore = doc.id), fallback:
        const snap = await getDocs(collection(db, 'treatments'));
        const list = [];
        snap.forEach((docu) => {
          if (treatmentIds.includes(docu.id)) list.push({ id: docu.id, ...docu.data() });
        });
        return { docs: list.map((x) => ({ data: () => x })) };
      });

      let total = 0;
      const trts = [];
      treatmentsSnap.docs.forEach((d) => {
        const t = d.data();
        trts.push(t);
        const dur = parseInt(t.duration, 10);
        if (!Number.isNaN(dur)) total += dur;
      });
      // Durée minimale 30 min
      total = Math.max(total, 30);
      setTotalDuration(total);

      // 2) Récupérer les rendez-vous existants pour cette date (hors annulés)
      const apptsSnap = await getDocs(
        query(
          collection(db, 'appointments'),
          where('date', '==', date),
          where('status', '!=', 'cancelled')
        )
      );

      const existing = [];
      apptsSnap.forEach((docu) => {
        const a = docu.data();
        try {
          const start = new Date(`${date}T${a.time}:00`);
          let dur = parseInt(a.duration, 10);
          if (Number.isNaN(dur) || dur <= 0) dur = 60; // fallback comme le backend
          const end = new Date(start.getTime() + dur * 60000);
          existing.push({ start, end });
        } catch (_) {}
      });

      // 3) Générer les créneaux selon l'algorithme du backend
      const opening = new Date(`${date}T09:00:00`);
      const closing = new Date(`${date}T18:00:00`);
      const lunchStart = new Date(`${date}T12:00:00`);
      const lunchEnd = new Date(`${date}T13:00:00`);
      const slotStep = 30; // minutes

      const slots = [];
      for (let t = new Date(opening); t < closing; t = new Date(t.getTime() + slotStep * 60000)) {
        const slotStart = new Date(t);
        const slotEnd = new Date(slotStart.getTime() + total * 60000);

        let ok = true;
        // Ne pas dépasser la fermeture
        if (slotEnd > closing) ok = false;
        // Éviter la pause dej
        if (slotStart < lunchEnd && slotEnd > lunchStart) ok = false;
        // Chevauchement avec RDV existants
        if (ok) {
          for (const ap of existing) {
            if (slotStart < ap.end && slotEnd > ap.start) { ok = false; break; }
          }
        }

        if (ok) slots.push(slotStart.toTimeString().slice(0, 5));
      }

      setAvailableSlots(slots);
      return { date, available_time_slots: slots, total_duration: total };
    } catch (error) {
      console.error('Erreur lors de la récupération des créneaux disponibles:', error);
      setSlotsError(
        error?.message ||
        'Une erreur est survenue lors de la récupération des créneaux disponibles.'
      );
      setAvailableSlots([]);
      throw error;
    } finally {
      setIsLoadingSlots(false);
    }
  }, []);

  /**
   * Crée une intention de paiement Stripe
   * @param {number} amount - Montant du paiement en euros
   */
  const createPaymentIntent = useCallback(async (amount) => {
    setIsCreatingPaymentIntent(true);
    setPaymentIntentError(null);
    try {
      const res = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency: 'EUR' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Erreur lors de la création du PaymentIntent');
      if (!data?.clientSecret) throw new Error('Client secret manquant');
      setPaymentIntent(data.clientSecret);
      return data.clientSecret;
    } catch (error) {
      console.error('Erreur PI Stripe:', error);
      setPaymentIntentError(error?.message || 'Impossible de préparer le paiement.');
      throw error;
    } finally {
      setIsCreatingPaymentIntent(false);
    }
  }, []);

  /**
   * Vérifie le statut d'un paiement
   * @param {string} paymentId - ID du paiement
   * @param {string} paymentMethod - Méthode de paiement (paypal ou stripe)
   */
  const checkPaymentStatus = useCallback(async (paymentId, paymentMethod) => {
    // Sans backend, on considère le paiement validé si l'intégration front a réussi
    return { payment_id: paymentId, status: 'completed', method: paymentMethod };
  }, []);

  /**
   * Crée une réservation avec paiement
   * @param {Object} reservationData - Données de la réservation
   */
  const createReservation = useCallback(async (reservationData) => {
    setIsCreatingReservation(true);
    setReservationError(null);

    try {
      if (!authUser) throw new Error('Unauthorized');

      const { date, time, treatments: trts, total_price, payment_method, payment_id, payment_status, payment_details, notes = '' } = reservationData;
      if (!date || !time || !Array.isArray(trts) || trts.length === 0) {
        throw new Error('Données de réservation invalides');
      }

      const treatmentIds = trts.map((t) => t.id);

      // Charger traitements pour durée + titre
      const treatmentsSnap = await getDocs(collection(db, 'treatments'));
      const selected = [];
      let totalDurationLocal = 0;
      treatmentsSnap.forEach((d) => {
        const data = { id: d.id, ...d.data() };
        if (treatmentIds.includes(data.id)) {
          selected.push(data);
          const dur = parseInt(data.duration, 10);
          if (!Number.isNaN(dur)) totalDurationLocal += dur;
        }
      });

      // Chevauchement
      const start = new Date(`${date}T${time}:00`);
      const end = new Date(start.getTime() + totalDurationLocal * 60000);

      const apptsSnap = await getDocs(
        query(
          collection(db, 'appointments'),
          where('date', '==', date),
          where('status', '!=', 'cancelled')
        )
      );
      for (const docu of apptsSnap.docs) {
        const a = docu.data();
        const aStart = new Date(`${date}T${a.time}:00`);
        let aDur = parseInt(a.duration, 10);
        if (Number.isNaN(aDur) || aDur <= 0) aDur = 60;
        const aEnd = new Date(aStart.getTime() + aDur * 60000);
        if (start < aEnd && end > aStart) {
          const err = new Error("Ce créneau horaire n'est plus disponible.");
          err.code = 'TIME_UNAVAILABLE';
          throw err;
        }
      }

      const title = selected.length === 0
        ? 'Rendez-vous sans traitement'
        : (selected.length === 1
          ? selected[0].name
          : `${selected[0].name} + ${selected.length - 1} autre${selected.length > 2 ? 's' : ''}`);

      // Créer le document de rendez-vous
      const payload = {
        userId: authUser?.uid || null,
        title,
        date,
        time,
        duration: totalDurationLocal,
        status: 'confirmed',
        notes,
        total_price,
        payment_method,
        payment_id,
        payment_status,
        payment_details,
        treatment_ids: treatmentIds,
        created_at: serverTimestamp(),
      };

      const ref = await addDoc(collection(db, 'appointments'), payload);
      const response = { message: 'Rendez-vous réservé avec succès', appointment: { id: ref.id, ...payload } };
      return response;
    } catch (error) {
      console.error('Erreur lors de la création de la réservation:', error);
      setReservationError(error?.message || 'Une erreur est survenue lors de la création de la réservation.');
      throw error;
    } finally {
      setIsCreatingReservation(false);
    }
  }, [authUser]);

  return {
    // États
    availableSlots,
    isLoadingSlots,
    slotsError,
    totalDuration,
    isCreatingReservation,
    reservationError,
    paymentIntent,
    isCreatingPaymentIntent,
    paymentIntentError,

    // Méthodes
    getAvailableTimeSlots,
    createPaymentIntent,
    checkPaymentStatus,
    createReservation
  };
}
