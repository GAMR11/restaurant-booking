import { useState, useCallback } from 'react';
import { reservationAPI } from '../services/api';
import { ReservationFormData, TimeSlot } from '../types';

export const useBooking = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

  // Usar useCallback para memorizar la función
  const fetchAvailability = useCallback(async (date: string, numberOfGuests: number) => {
    setLoading(true);
    setError(null);
    try {
      const slots = await reservationAPI.getAvailability(date, numberOfGuests);
      setAvailableSlots(slots);
      return slots;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al obtener disponibilidad';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []); // Sin dependencias porque no usa ningún estado externo

  const createReservation = useCallback(async (data: ReservationFormData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await reservationAPI.createReservation(data);
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al crear la reserva';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelReservation = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await reservationAPI.cancelReservation(id);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al cancelar la reserva';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    availableSlots,
    fetchAvailability,
    createReservation,
    cancelReservation,
  };
};