import { Request, Response } from 'express';
import { ReservationService } from '../services/reservationService';
import { CreateReservationDTO, UpdateReservationDTO } from '../types';

const reservationService = new ReservationService();

export const createReservation = async (req: Request, res: Response) => {
  try {
    const data: CreateReservationDTO = req.body;
    const reservation = await reservationService.createReservation(data);
    res.status(201).json({
      success: true,
      data: reservation,
      message: 'Reserva creada exitosamente',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAvailability = async (req: Request, res: Response) => {
  try {
    const { date, numberOfGuests } = req.query;
    
    if (!date || !numberOfGuests) {
      return res.status(400).json({
        success: false,
        message: 'Fecha y número de personas son requeridos',
      });
    }

    const timeSlots = await reservationService.getAvailableTimeSlots(
      date as string,
      parseInt(numberOfGuests as string)
    );

    res.json({
      success: true,
      data: timeSlots,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getReservation = async (req: Request, res: Response) => {
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
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateReservation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data: UpdateReservationDTO = req.body;
    const reservation = await reservationService.updateReservation(id, data);
    
    res.json({
      success: true,
      data: reservation,
      message: 'Reserva actualizada exitosamente',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const cancelReservation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const reservation = await reservationService.cancelReservation(id);
    
    res.json({
      success: true,
      data: reservation,
      message: 'Reserva cancelada exitosamente',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};