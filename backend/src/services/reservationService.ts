import prisma from '../config/database';
import { CalendarService } from './calendarService';
import { CreateReservationDTO, UpdateReservationDTO, TimeSlot } from '../types'; 
import { ReservationStatus } from '@prisma/client'; 
import { generateTimeSlots } from '../utils/dateUtils';

export class ReservationService {
  private calendarService: CalendarService;

  constructor() {
    this.calendarService = new CalendarService();
  }

  // ------------------------------------
  // Método de Creación
  // ------------------------------------
  async createReservation(data: CreateReservationDTO) {
    // Validar disponibilidad
    const isAvailable = await this.checkAvailability(
      data.reservationDate,
      data.reservationTime,
      data.numberOfGuests
    );
  
    if (!isAvailable) {
      throw new Error('No hay disponibilidad para la fecha y hora seleccionadas');
    }
  
    // Crear reserva en la base de datos
    const reservation = await prisma.reservation.create({
      data: {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        numberOfGuests: data.numberOfGuests,
        reservationDate: new Date(data.reservationDate),
        reservationTime: data.reservationTime,
        // reservationEndTime: data.reservationEndTime,
        // reservationEndTime: data.reservationEndTime ?? null,
        // reservationEndTime: data.reservationEndTime ?? undefined,
        reservationEndTime: data.reservationEndTime ? data.reservationEndTime : undefined,
        menuType: data.menuType,
        theme: data.theme,
        tablePreference: data.tablePreference,
        specialRequests: data.specialRequests,
        dietaryRestrictions: data.dietaryRestrictions,
        status: ReservationStatus.PENDING, 
      },
    });
  
    console.log('✅ Reserva creada en DB:', reservation.id);
  
    // Intentar crear evento en Google Calendar (opcional - no bloquea si falla)
    let eventId: string | undefined;
    try {
      console.log('📅 Intentando crear evento en Google Calendar...');
      
      eventId = await this.calendarService.createEvent({
        customerName: reservation.customerName,
        customerEmail: reservation.customerEmail,
        numberOfGuests: reservation.numberOfGuests,
        reservationDate: reservation.reservationDate,
        reservationTime: reservation.reservationTime,
        reservationEndTime: data.reservationEndTime ? data.reservationEndTime : '',
        // reservationEndTime: data.reservationEndTime, // ✅ NUEVO
        menuType: reservation.menuType,
        specialRequests: reservation.specialRequests,
      });
  
      console.log('✅ Evento creado en Google Calendar:', eventId);
    } catch (error: any) {
      console.error('⚠️ Error al crear evento en Google Calendar:');
      console.error('Código:', error.code);
      console.error('Mensaje:', error.message);
      if (error.errors) {
        console.error('Detalles:', JSON.stringify(error.errors, null, 2));
      }
      console.log('✅ Continuando sin sincronización con calendario...');
      // NO lanzamos error - la reserva se mantiene aunque falle Calendar
    }
  
    // Actualizar reserva con el ID del evento (si existe) y confirmar
    const updatedReservation = await prisma.reservation.update({
      where: { id: reservation.id },
      data: { 
        googleEventId: eventId || null,
        status: ReservationStatus.CONFIRMED,
      },
    });
  
    console.log('✅ Reserva confirmada:', updatedReservation.id);
    
    return updatedReservation;
  }

  // ... (getAvailableTimeSlots y checkAvailability quedan iguales)
  async getAvailableTimeSlots(date: string, numberOfGuests: number): Promise<TimeSlot[]> {
    try {
      // 1. Obtener configuración del restaurante
      const settings = await prisma.restaurantSettings.findFirst();
      if (!settings) {
        throw new Error('Configuración del restaurante no encontrada');
      }
  
      const dateToCheck = new Date(date);
  
      // 2. Verificar si la fecha está bloqueada
      const blockedDate = await prisma.blockedDate.findUnique({
        where: { date: dateToCheck },
      });
  
      if (blockedDate) {
        console.log('⚠️ Fecha bloqueada:', date);
        return [];
      }
  
      // 3. Generar todos los slots posibles según configuración
      const allTimeSlots = generateTimeSlots(
        settings.openingTime,
        settings.closingTime,
        settings.slotDuration
      );
  
      console.log(`📊 Slots generados: ${allTimeSlots.length}`);
  
      // 4. Obtener slots ocupados desde Google Calendar
      let occupiedSlots: Map<string, number>;
      try {
        occupiedSlots = await this.calendarService.getOccupiedSlots(dateToCheck);
      } catch (error) {
        console.error('⚠️ Error al consultar Google Calendar, usando solo DB como respaldo');
        // Fallback: usar solo la base de datos si Google Calendar falla
        return this.getAvailableTimeSlotsFromDB(date, numberOfGuests, settings, allTimeSlots);
      }
  
      // 5. Calcular disponibilidad
      const availability: TimeSlot[] = allTimeSlots.map((time) => {
        const occupiedGuests = occupiedSlots.get(time) || 0;
        const remainingCapacity = settings.maxGuestsPerSlot - occupiedGuests;
        const available = remainingCapacity >= numberOfGuests;
  
        return {
          time,
          available,
          remainingCapacity: Math.max(0, remainingCapacity),
        };
      });
  
      console.log(`✅ Disponibilidad calculada desde Google Calendar para ${date}`);
      return availability;
    } catch (error) {
      console.error('❌ Error en getAvailableTimeSlots:', error);
      throw error;
    }
  }
  
  /**
   * Método de respaldo: Calcular disponibilidad solo desde la base de datos
   * Se usa si Google Calendar no está disponible
   */
  private async getAvailableTimeSlotsFromDB(
    date: string,
    numberOfGuests: number,
    settings: any,
    timeSlots: string[]
  ): Promise<TimeSlot[]> {
    console.log('📦 Usando base de datos como respaldo');
    
    const dateToCheck = new Date(date);
    const existingReservations = await prisma.reservation.findMany({
      where: {
        reservationDate: dateToCheck,
        status: { in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] },
      },
    });
  
    const availability: TimeSlot[] = timeSlots.map((time) => {
      const reservationsInSlot = existingReservations.filter(
        (r) => r.reservationTime === time
      );
  
      const totalGuestsInSlot = reservationsInSlot.reduce(
        (sum, r) => sum + r.numberOfGuests,
        0
      );
  
      const remainingCapacity = settings.maxGuestsPerSlot - totalGuestsInSlot;
      const available = remainingCapacity >= numberOfGuests;
  
      return {
        time,
        available,
        remainingCapacity: Math.max(0, remainingCapacity),
      };
    });
  
    return availability;
  }

  async checkAvailability(
    date: string,
    time: string,
    numberOfGuests: number
  ): Promise<boolean> {
    const slots = await this.getAvailableTimeSlots(date, numberOfGuests);
    const slot = slots.find((s) => s.time === time);
    return slot?.available ?? false;
  }

  // ------------------------------------
  // Función updateReservation CORREGIDA
  // ------------------------------------
  async getReservationById(id: string) {
    return await prisma.reservation.findUnique({
      where: { id },
    });
  }

  async updateReservation(id: string, data: UpdateReservationDTO) {
    const reservation = await prisma.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      throw new Error('Reserva no encontrada');
    }
    
    // CORRECCIÓN: Desestructurar los campos problemáticos (status, reservationDate)
    // para evitar que el 'string' entre en el spread 'restOfData'.
    const { status, reservationDate, ...restOfData } = data;
    
    const updateData: any = {
      // 1. Aplicar el resto de los datos
      ...restOfData,
      
      // 2. Manejar la fecha
      reservationDate: reservationDate ? new Date(reservationDate) : undefined,
    };
    
    // 3. Añadir el status solo si existe, con el Type Assertion necesario.
    if (status) {
        updateData.status = status as ReservationStatus; 
    }

    // Actualizar en la base de datos
    const updated = await prisma.reservation.update({
      where: { id },
      data: updateData,
    });

    // Actualizar en Google Calendar si existe el evento y hay cambios en fecha/hora
    if (reservation.googleEventId && (reservationDate || data.reservationTime)) {
      try {
        await this.calendarService.updateEvent(reservation.googleEventId, {
          numberOfGuests: data.numberOfGuests,
          reservationDate: reservationDate ? new Date(reservationDate) : undefined,
          reservationTime: data.reservationTime,
        });
      } catch (error) {
        console.error('Error actualizando evento en Google Calendar:', error);
      }
    }

    return updated;
  }

  async cancelReservation(id: string) {
    const reservation = await prisma.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      throw new Error('Reserva no encontrada');
    }

    if (reservation.googleEventId) {
      try {
        await this.calendarService.deleteEvent(reservation.googleEventId);
      } catch (error) {
        console.error('Error eliminando evento de Google Calendar:', error);
      }
    }

    return await prisma.reservation.update({
      where: { id },
      data: { status: ReservationStatus.CANCELLED },
    });
  }
}