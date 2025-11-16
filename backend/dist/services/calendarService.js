"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarService = void 0;
const googleCalendar_1 = require("../config/googleCalendar");
class CalendarService {
    constructor() {
        this.calendar = (0, googleCalendar_1.getCalendarClient)();
    }
    /**
     * Obtiene todos los eventos del calendario para una fecha específica
     */
    async getEventsForDate(date) {
        try {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            console.log('📅 Consultando eventos en Google Calendar para:', date.toISOString().split('T')[0]);
            const response = await this.calendar.events.list({
                calendarId: process.env.GOOGLE_CALENDAR_ID,
                timeMin: startOfDay.toISOString(),
                timeMax: endOfDay.toISOString(),
                singleEvents: true,
                orderBy: 'startTime',
            });
            const events = response.data.items || [];
            console.log(`✅ Encontrados ${events.length} eventos en el calendario`);
            return events;
        }
        catch (error) {
            console.error('❌ Error al leer eventos de Google Calendar:', error.message);
            throw error;
        }
    }
    /**
     * Extrae el número de personas de un evento
     */
    extractGuestsFromEvent(event) {
        const summaryMatch = event.summary?.match(/(\d+)\s*personas?/i);
        if (summaryMatch) {
            return parseInt(summaryMatch[1]);
        }
        const descMatch = event.description?.match(/Número de personas:\s*(\d+)/i);
        if (descMatch) {
            return parseInt(descMatch[1]);
        }
        return 2;
    }
    /**
     * Genera todos los slots que ocupa un evento entre inicio y fin
     */
    getSlotsBetween(startTime, endTime) {
        const slots = [];
        const current = new Date(startTime);
        // Redondear al slot más cercano
        current.setMinutes(Math.floor(current.getMinutes() / 30) * 30);
        current.setSeconds(0);
        current.setMilliseconds(0);
        while (current < endTime) {
            const timeSlot = `${String(current.getHours()).padStart(2, '0')}:${String(current.getMinutes()).padStart(2, '0')}`;
            slots.push(timeSlot);
            // Avanzar según el slotDuration (30 minutos por defecto)
            current.setMinutes(current.getMinutes() + 30);
        }
        return slots;
    }
    /**
     * Obtiene los horarios ocupados considerando la DURACIÓN completa de cada evento
     */
    async getOccupiedSlots(date) {
        const events = await this.getEventsForDate(date);
        const occupiedSlots = new Map();
        for (const event of events) {
            if (!event.start?.dateTime || !event.end?.dateTime)
                continue;
            const startTime = new Date(event.start.dateTime);
            const endTime = new Date(event.end.dateTime);
            const guests = this.extractGuestsFromEvent(event);
            console.log(`   📅 Procesando: "${event.summary}"`);
            console.log(`      Inicio: ${startTime.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}`);
            console.log(`      Fin: ${endTime.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}`);
            console.log(`      Personas: ${guests}`);
            // Generar todos los slots que ocupa este evento
            const occupiedTimeSlots = this.getSlotsBetween(startTime, endTime);
            for (const timeSlot of occupiedTimeSlots) {
                const currentGuests = occupiedSlots.get(timeSlot) || 0;
                occupiedSlots.set(timeSlot, currentGuests + guests);
                console.log(`      ✓ Slot ${timeSlot}: +${guests} personas (Total: ${currentGuests + guests})`);
            }
        }
        return occupiedSlots;
    }
    /**
     * 🔧 FUNCIÓN AUXILIAR: Crea un objeto Date en zona horaria de Ecuador
     */
    createEcuadorDateTime(dateString, timeString) {
        // dateString viene como "2025-11-14" (formato ISO)
        // timeString viene como "07:00"
        const [year, month, day] = dateString.split('-').map(Number);
        const [hours, minutes] = timeString.split(':').map(Number);
        // Crear fecha en formato ISO con zona horaria de Ecuador (-05:00)
        // Formato: 2025-11-14T07:00:00-05:00
        const isoString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00-05:00`;
        return new Date(isoString);
    }
    /**
     * Crea un evento en Google Calendar
     */
    async createEvent(reservation) {
        // Convertir la fecha a string en formato YYYY-MM-DD
        const dateString = reservation.reservationDate.toISOString().split('T')[0];
        // Crear fecha de inicio en zona horaria de Ecuador
        const startDateTime = this.createEcuadorDateTime(dateString, reservation.reservationTime);
        // Crear fecha de fin
        let endDateTime;
        if (reservation.reservationEndTime) {
            endDateTime = this.createEcuadorDateTime(dateString, reservation.reservationEndTime);
            // Si inicio y fin son iguales (un solo slot), sumar 30 minutos
            if (reservation.reservationTime === reservation.reservationEndTime) {
                endDateTime = new Date(startDateTime);
                endDateTime.setMinutes(endDateTime.getMinutes() + 30);
            }
        }
        else {
            // Default: 2 horas si no se especifica fin
            endDateTime = new Date(startDateTime);
            endDateTime.setHours(startDateTime.getHours() + 2);
        }
        console.log('📅 Creando evento en Google Calendar:');
        console.log(`   Cliente: ${reservation.customerName}`);
        console.log(`   Fecha original: ${dateString}`);
        console.log(`   Hora inicio: ${reservation.reservationTime}`);
        console.log(`   Hora fin: ${reservation.reservationEndTime || 'default +2h'}`);
        console.log(`   DateTime inicio: ${startDateTime.toISOString()}`);
        console.log(`   DateTime fin: ${endDateTime.toISOString()}`);
        console.log(`   Personas: ${reservation.numberOfGuests}`);
        const event = {
            summary: `Reserva: ${reservation.customerName} - ${reservation.numberOfGuests} personas`,
            description: `
Cliente: ${reservation.customerName}
Email: ${reservation.customerEmail}
Número de personas: ${reservation.numberOfGuests}
Menú: ${reservation.menuType}
${reservation.specialRequests ? `Solicitudes especiales: ${reservation.specialRequests}` : ''}

--- 
Reserva creada desde el sistema de gestión del restaurante
      `.trim(),
            start: {
                dateTime: startDateTime.toISOString(),
                timeZone: 'America/Guayaquil',
            },
            end: {
                dateTime: endDateTime.toISOString(),
                timeZone: 'America/Guayaquil',
            },
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'popup', minutes: 24 * 60 }, // 1 día antes
                    { method: 'popup', minutes: 60 }, // 1 hora antes
                ],
            },
            colorId: '9', // Color azul para reservas
        };
        const response = await this.calendar.events.insert({
            calendarId: process.env.GOOGLE_CALENDAR_ID,
            requestBody: event,
            sendUpdates: 'none',
        });
        console.log('✅ Evento creado exitosamente:', response.data.id);
        return response.data.id;
    }
    /**
     * Actualiza un evento existente en Google Calendar
     */
    async updateEvent(eventId, updates) {
        try {
            const event = await this.calendar.events.get({
                calendarId: process.env.GOOGLE_CALENDAR_ID,
                eventId,
            });
            // Actualizar fechas/horas si se proporcionaron
            if (updates.reservationDate && updates.reservationTime) {
                const dateString = updates.reservationDate.toISOString().split('T')[0];
                const startDateTime = this.createEcuadorDateTime(dateString, updates.reservationTime);
                let endDateTime;
                if (updates.reservationEndTime) {
                    endDateTime = this.createEcuadorDateTime(dateString, updates.reservationEndTime);
                    // Si inicio y fin son iguales, sumar 30 minutos
                    if (updates.reservationTime === updates.reservationEndTime) {
                        endDateTime = new Date(startDateTime);
                        endDateTime.setMinutes(endDateTime.getMinutes() + 30);
                    }
                }
                else {
                    endDateTime = new Date(startDateTime);
                    endDateTime.setHours(startDateTime.getHours() + 2);
                }
                event.data.start = {
                    dateTime: startDateTime.toISOString(),
                    timeZone: 'America/Guayaquil',
                };
                event.data.end = {
                    dateTime: endDateTime.toISOString(),
                    timeZone: 'America/Guayaquil',
                };
            }
            // Actualizar número de personas en el título
            if (updates.numberOfGuests) {
                const currentSummary = event.data.summary || '';
                const updatedSummary = currentSummary.replace(/\d+\s*personas?/i, `${updates.numberOfGuests} personas`);
                event.data.summary = updatedSummary;
            }
            await this.calendar.events.update({
                calendarId: process.env.GOOGLE_CALENDAR_ID,
                eventId,
                requestBody: event.data,
                sendUpdates: 'none',
            });
            console.log('✅ Evento actualizado en Google Calendar:', eventId);
        }
        catch (error) {
            console.error('❌ Error actualizando evento:', error.message);
            throw error;
        }
    }
    /**
     * Elimina un evento de Google Calendar
     */
    async deleteEvent(eventId) {
        try {
            await this.calendar.events.delete({
                calendarId: process.env.GOOGLE_CALENDAR_ID,
                eventId,
                sendUpdates: 'none',
            });
            console.log('✅ Evento eliminado de Google Calendar:', eventId);
        }
        catch (error) {
            console.error('❌ Error eliminando evento:', error.message);
            throw error;
        }
    }
}
exports.CalendarService = CalendarService;
