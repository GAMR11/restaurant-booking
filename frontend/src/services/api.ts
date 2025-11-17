import axios from 'axios';
import { ReservationFormData, TimeSlot, ApiResponse } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'https://backend-restaurant-booking-production.up.railway.app/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const reservationAPI = {
  // Obtener disponibilidad
  getAvailability: async (date: string, numberOfGuests: number): Promise<TimeSlot[]> => {
    const response = await api.get<ApiResponse<TimeSlot[]>>('/availability', {
      params: { date, numberOfGuests },
    });
    return response.data.data || [];
  },

  // Crear reserva
  createReservation: async (data: ReservationFormData) => {
    const response = await api.post('/reservations', data);
    return response.data;
  },

  // Obtener reserva por ID
  getReservation: async (id: string) => {
    const response = await api.get(`/reservations/${id}`);
    return response.data;
  },

  // Actualizar reserva
  updateReservation: async (id: string, data: Partial<ReservationFormData>) => {
    const response = await api.put(`/reservations/${id}`, data);
    return response.data;
  },

  // Cancelar reserva
  cancelReservation: async (id: string) => {
    const response = await api.delete(`/reservations/${id}`);
    return response.data;
  },
};

export default api;