import React from 'react';
import { ReservationFormData } from '../../types';

interface Step4Props {
  formData: ReservationFormData;
}

export const Step4Confirmation: React.FC<Step4Props> = ({ formData }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-EC', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const menuLabels: Record<string, string> = {
    ejecutivo: 'Menú Ejecutivo',
    a_la_carta: 'A la Carta',
    degustacion: 'Menú Degustación',
    especial: 'Menú Especial',
  };

  const themeLabels: Record<string, string> = {
    ninguno: 'Sin temática especial',
    cumpleanos: 'Cumpleaños',
    aniversario: 'Aniversario',
    negocios: 'Comida de Negocios',
    romantica: 'Cena Romántica',
    familiar: 'Reunión Familiar',
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Confirmar Reserva
      </h2>

      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div className="border-b pb-4">
          <h3 className="font-semibold text-lg text-gray-800 mb-3">
            Información Personal
          </h3>
          <div className="space-y-2 text-gray-700">
            <p><strong>Nombre:</strong> {formData.customerName}</p>
            <p><strong>Email:</strong> {formData.customerEmail}</p>
            <p><strong>Teléfono:</strong> {formData.customerPhone}</p>
          </div>
        </div>

        <div className="border-b pb-4">
          <h3 className="font-semibold text-lg text-gray-800 mb-3">
            Detalles de la Reserva
          </h3>
          <div className="space-y-2 text-gray-700">
            <p><strong>Fecha:</strong> {formatDate(formData.reservationDate)}</p>
            <p><strong>Horario:</strong> De {formData.reservationTime} a {formData.reservationEndTime}</p>
            <p><strong>Número de personas:</strong> {formData.numberOfGuests}</p>
          </div>
        </div>

        <div className="border-b pb-4">
          <h3 className="font-semibold text-lg text-gray-800 mb-3">
            Preferencias
          </h3>
          <div className="space-y-2 text-gray-700">
            <p><strong>Menú:</strong> {menuLabels[formData.menuType]}</p>
            {formData.theme && formData.theme !== 'ninguno' && (
              <p><strong>Ocasión:</strong> {themeLabels[formData.theme]}</p>
            )}
            {formData.tablePreference && formData.tablePreference !== 'sin_preferencia' && (
              <p><strong>Preferencia de mesa:</strong> {formData.tablePreference}</p>
            )}
          </div>
        </div>

        {(formData.dietaryRestrictions || formData.specialRequests) && (
          <div>
            <h3 className="font-semibold text-lg text-gray-800 mb-3">
              Notas Adicionales
            </h3>
            <div className="space-y-2 text-gray-700">
              {formData.dietaryRestrictions && (
                <div>
                  <strong>Restricciones alimentarias:</strong>
                  <p className="mt-1 text-sm">{formData.dietaryRestrictions}</p>
                </div>
              )}
              {formData.specialRequests && (
                <div>
                  <strong>Solicitudes especiales:</strong>
                  <p className="mt-1 text-sm">{formData.specialRequests}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
        <p className="text-sm text-blue-700">
          <strong>Importante:</strong> Recibirás un correo de confirmación con todos los detalles
          de tu reserva. El evento también será agregado a tu calendario.
        </p>
      </div>
    </div>
  );


  // Agregar esta función dentro del componente
const calculateDuration = () => {
  if (!formData.reservationTime || !formData.reservationEndTime) {
    return '2 horas'; // Por defecto
  }
  
  const [startH, startM] = formData.reservationTime.split(':').map(Number);
  const [endH, endM] = formData.reservationEndTime.split(':').map(Number);
  
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  const durationMinutes = endMinutes - startMinutes;
  
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  
  if (hours === 0) return `${minutes} minutos`;
  if (minutes === 0) return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  return `${hours}h ${minutes}min`;
};

// Modificar la sección de Detalles de la Reserva:
<div className="border-b pb-4">
  <h3 className="font-semibold text-lg text-gray-800 mb-3">
    Detalles de la Reserva
  </h3>
  <div className="space-y-2 text-gray-700">
    <p><strong>Fecha:</strong> {formatDate(formData.reservationDate)}</p>
    <p>
      <strong>Hora:</strong> {formData.reservationTime}
      {formData.reservationEndTime && ` - ${formData.reservationEndTime}`}
    </p>
    {formData.reservationEndTime && (
      <p><strong>Duración:</strong> {calculateDuration()}</p>
    )}
    <p><strong>Número de personas:</strong> {formData.numberOfGuests}</p>
  </div>
</div>
};