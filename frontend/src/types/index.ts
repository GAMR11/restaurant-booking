export interface ReservationFormData {
  // Step 1: Información personal
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  
  // Step 2: Fecha, hora y duración
  reservationDate: string;
  reservationTime: string;
  reservationEndTime: string; // ✅ NUEVO: Hora de fin
  numberOfGuests: number;
  
  // Step 3: Detalles
  menuType: string;
  theme?: string;
  tablePreference?: string;
  specialRequests?: string;
  dietaryRestrictions?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  remainingCapacity: number;
}
  
  export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
  }