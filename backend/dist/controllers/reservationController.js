"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelReservation = exports.updateReservation = exports.getReservation = exports.getAvailability = exports.createReservation = void 0;
const reservationService_1 = require("../services/reservationService");
const reservationService = new reservationService_1.ReservationService();
const createReservation = async (req, res) => {
    try {
        const data = req.body;
        const reservation = await reservationService.createReservation(data);
        res.status(201).json({
            success: true,
            data: reservation,
            message: 'Reserva creada exitosamente',
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
exports.createReservation = createReservation;
const getAvailability = async (req, res) => {
    try {
        const { date, numberOfGuests } = req.query;
        if (!date || !numberOfGuests) {
            return res.status(400).json({
                success: false,
                message: 'Fecha y número de personas son requeridos',
            });
        }
        const timeSlots = await reservationService.getAvailableTimeSlots(date, parseInt(numberOfGuests));
        res.json({
            success: true,
            data: timeSlots,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
exports.getAvailability = getAvailability;
const getReservation = async (req, res) => {
    try {
        const { id } = req.params;
        const reservation = await reservationService.getReservationById(id);
        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reserva no encontrada',
            });
        }
        res.json({
            success: true,
            data: reservation,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
exports.getReservation = getReservation;
const updateReservation = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const reservation = await reservationService.updateReservation(id, data);
        res.json({
            success: true,
            data: reservation,
            message: 'Reserva actualizada exitosamente',
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
exports.updateReservation = updateReservation;
const cancelReservation = async (req, res) => {
    try {
        const { id } = req.params;
        const reservation = await reservationService.cancelReservation(id);
        res.json({
            success: true,
            data: reservation,
            message: 'Reserva cancelada exitosamente',
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
exports.cancelReservation = cancelReservation;
