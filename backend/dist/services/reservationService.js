"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationService = void 0;
const database_1 = __importDefault(require("../config/database"));
const calendarService_1 = require("./calendarService");
const client_1 = require("@prisma/client");
const dateUtils_1 = require("../utils/dateUtils");
class ReservationService {
    constructor() {
        this.calendarService = new calendarService_1.CalendarService();
    }
    // ------------------------------------
    // Método de Creación
    // ------------------------------------
    async createReservation(data) {
        // Validar disponibilidad
        const isAvailable = await this.checkAvailability(data.reservationDate, data.reservationTime, data.numberOfGuests);
        if (!isAvailable) {
            throw new Error('No hay disponibilidad para la fecha y hora seleccionadas');
        }
        // Crear reserva en la base de datos
        const reservation = await database_1.default.reservation.create({
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
                status: client_1.ReservationStatus.PENDING,
            },
        });
        console.log('✅ Reserva creada en DB:', reservation.id);
        // Intentar crear evento en Google Calendar (opcional - no bloquea si falla)
        let eventId;
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
        }
        catch (error) {
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
        const updatedReservation = await database_1.default.reservation.update({
            where: { id: reservation.id },
            data: {
                googleEventId: eventId || null,
                status: client_1.ReservationStatus.CONFIRMED,
            },
        });
        console.log('✅ Reserva confirmada:', updatedReservation.id);
        return updatedReservation;
    }
    // ... (getAvailableTimeSlots y checkAvailability quedan iguales)
    async getAvailableTimeSlots(date, numberOfGuests) {
        try {
            // 1. Obtener configuración del restaurante
            const settings = await database_1.default.restaurantSettings.findFirst();
            if (!settings) {
                throw new Error('Configuración del restaurante no encontrada');
            }
            const dateToCheck = new Date(date);
            // 2. Verificar si la fecha está bloqueada
            const blockedDate = await database_1.default.blockedDate.findUnique({
                where: { date: dateToCheck },
            });
            if (blockedDate) {
                console.log('⚠️ Fecha bloqueada:', date);
                return [];
            }
            // 3. Generar todos los slots posibles según configuración
            const allTimeSlots = (0, dateUtils_1.generateTimeSlots)(settings.openingTime, settings.closingTime, settings.slotDuration);
            console.log(`📊 Slots generados: ${allTimeSlots.length}`);
            // 4. Obtener slots ocupados desde Google Calendar
            let occupiedSlots;
            try {
                occupiedSlots = await this.calendarService.getOccupiedSlots(dateToCheck);
            }
            catch (error) {
                console.error('⚠️ Error al consultar Google Calendar, usando solo DB como respaldo');
                // Fallback: usar solo la base de datos si Google Calendar falla
                return this.getAvailableTimeSlotsFromDB(date, numberOfGuests, settings, allTimeSlots);
            }
            // 5. Calcular disponibilidad
            const availability = allTimeSlots.map((time) => {
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
        }
        catch (error) {
            console.error('❌ Error en getAvailableTimeSlots:', error);
            throw error;
        }
    }
    /**
     * Método de respaldo: Calcular disponibilidad solo desde la base de datos
     * Se usa si Google Calendar no está disponible
     */
    async getAvailableTimeSlotsFromDB(date, numberOfGuests, settings, timeSlots) {
        console.log('📦 Usando base de datos como respaldo');
        const dateToCheck = new Date(date);
        const existingReservations = await database_1.default.reservation.findMany({
            where: {
                reservationDate: dateToCheck,
                status: { in: [client_1.ReservationStatus.PENDING, client_1.ReservationStatus.CONFIRMED] },
            },
        });
        const availability = timeSlots.map((time) => {
            const reservationsInSlot = existingReservations.filter((r) => r.reservationTime === time);
            const totalGuestsInSlot = reservationsInSlot.reduce((sum, r) => sum + r.numberOfGuests, 0);
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
    async checkAvailability(date, time, numberOfGuests) {
        const slots = await this.getAvailableTimeSlots(date, numberOfGuests);
        const slot = slots.find((s) => s.time === time);
        return slot?.available ?? false;
    }
    // ------------------------------------
    // Función updateReservation CORREGIDA
    // ------------------------------------
    async getReservationById(id) {
        return await database_1.default.reservation.findUnique({
            where: { id },
        });
    }
    async updateReservation(id, data) {
        const reservation = await database_1.default.reservation.findUnique({
            where: { id },
        });
        if (!reservation) {
            throw new Error('Reserva no encontrada');
        }
        // CORRECCIÓN: Desestructurar los campos problemáticos (status, reservationDate)
        // para evitar que el 'string' entre en el spread 'restOfData'.
        const { status, reservationDate, ...restOfData } = data;
        const updateData = {
            // 1. Aplicar el resto de los datos
            ...restOfData,
            // 2. Manejar la fecha
            reservationDate: reservationDate ? new Date(reservationDate) : undefined,
        };
        // 3. Añadir el status solo si existe, con el Type Assertion necesario.
        if (status) {
            updateData.status = status;
        }
        // Actualizar en la base de datos
        const updated = await database_1.default.reservation.update({
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
            }
            catch (error) {
                console.error('Error actualizando evento en Google Calendar:', error);
            }
        }
        return updated;
    }
    async cancelReservation(id) {
        const reservation = await database_1.default.reservation.findUnique({
            where: { id },
        });
        if (!reservation) {
            throw new Error('Reserva no encontrada');
        }
        if (reservation.googleEventId) {
            try {
                await this.calendarService.deleteEvent(reservation.googleEventId);
            }
            catch (error) {
                console.error('Error eliminando evento de Google Calendar:', error);
            }
        }
        return await database_1.default.reservation.update({
            where: { id },
            data: { status: client_1.ReservationStatus.CANCELLED },
        });
    }
}
exports.ReservationService = ReservationService;
