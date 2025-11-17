import React from 'react';
import { BookingForm } from '../components/BookingForm/BookingForm';

export const Booking: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Hacer una Reserva</h1>
          <p className="text-gray-600 mt-2">
            Completa el formulario para reservar tu mesa
          </p>
        </div>
        <BookingForm />
      </div>
    </div>
  );
};