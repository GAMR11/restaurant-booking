export interface CreateReservationDTO {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    numberOfGuests: number;
    reservationDate: string; // ISO format
    reservationTime: string;
    reservationEndTime?: string | null; 
    // reservationEndTime?: string; // ✅ NUEVO: Opcional, si no se envía usa 2 horas por defecto
    menuType: string;
    theme?: string;
    tablePreference?: string;
    specialRequests?: string;
    dietaryRestrictions?: string;
  }
  
  export interface UpdateReservationDTO {
    numberOfGuests?: number;
    reservationDate?: string;
    reservationTime?: string;
    menuType?: string;
    theme?: string;
    tablePreference?: string;
    specialRequests?: string;
    dietaryRestrictions?: string;
    status?: string;
  }
  
  export interface AvailabilityQuery {
    date: string;
    numberOfGuests: number;
  }
  
  export interface TimeSlot {
    time: string;
    available: boolean;
    remainingCapacity: number;
  }