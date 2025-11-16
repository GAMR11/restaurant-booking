"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFutureDate = exports.isValidDate = exports.generateTimeSlots = void 0;
const generateTimeSlots = (openingTime, closingTime, slotDuration) => {
    const slots = [];
    const [openHour, openMin] = openingTime.split(':').map(Number);
    const [closeHour, closeMin] = closingTime.split(':').map(Number);
    let currentHour = openHour;
    let currentMin = openMin;
    while (currentHour < closeHour ||
        (currentHour === closeHour && currentMin < closeMin)) {
        const timeSlot = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
        slots.push(timeSlot);
        currentMin += slotDuration;
        if (currentMin >= 60) {
            currentHour += Math.floor(currentMin / 60);
            currentMin = currentMin % 60;
        }
    }
    return slots;
};
exports.generateTimeSlots = generateTimeSlots;
const isValidDate = (dateString) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
};
exports.isValidDate = isValidDate;
const isFutureDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
};
exports.isFutureDate = isFutureDate;
