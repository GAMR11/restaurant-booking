import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { reservationAPI } from '../services/api';
import { Button } from '../components/common/Button';

export const Confirmation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [reservation, setReservation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservation = async () => {
      if (!id) return;
      try {
        const response = await reservationAPI.getReservation(id);
        setReservation(response.data);
      } catch (error) {
        console.error('Error al obtener reserva:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservation();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Reserva no encontrada</p>
          <Link to="/" className="mt-4 inline-block">
            <Button>Volver al inicio</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-EC', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <svg
              className="w-12 h-12 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">
            ¡Reserva Confirmada!
          </h1>
          <p className="text-gray-600 mt-2">
            Tu reserva ha sido confirmada exitosamente
          </p>
        </div>

        {/* Reservation Details */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="border-b pb-4 mb-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Detalles de la Reserva
            </h2>
            <div className="space-y-3 text-gray-700">
              <div className="flex justify-between">
                <span className="font-medium">Número de confirmación:</span>
                <span className="text-primary font-mono">{reservation.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Nombre:</span>
                <span>{reservation.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Email:</span>
                <span>{reservation.customerEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Teléfono:</span>
                <span>{reservation.customerPhone}</span>
              </div>
            </div>
          </div>

          <div className="border-b pb-4 mb-4">
            <h3 className="font-semibold text-gray-800 mb-3">Fecha y Hora</h3>
            <div className="space-y-2 text-gray-700">
              <p className="text-lg">
                <span className="font-medium">📅 </span>
                {formatDate(reservation.reservationDate)}
              </p>
              <p className="text-lg">
                <span className="font-medium">🕐 </span>
                De {reservation.reservationTime} a {reservation.reservationEndTime}
              </p>
              <p className="text-lg">
                <span className="font-medium">👥 </span>
                {reservation.numberOfGuests} personas
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Información Adicional</h3>
            <div className="space-y-2 text-gray-700">
              <p><span className="font-medium">Menú:</span> {reservation.menuType}</p>
              {reservation.theme && (
                <p><span className="font-medium">Ocasión:</span> {reservation.theme}</p>
              )}
              {reservation.tablePreference && (
                <p><span className="font-medium">Mesa:</span> {reservation.tablePreference}</p>
              )}
            </div>
          </div>
        </div>

        {/* Information Box */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Confirmación enviada</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Hemos enviado un correo de confirmación a <strong>{reservation.customerEmail}</strong> con todos los detalles de tu reserva.
                </p>
                <p className="mt-2">
                  El evento también ha sido agregado a tu calendario de Google.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button variant="primary" className="w-full sm:w-auto">
              Volver al Inicio
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="w-full sm:w-auto"
          >
            Imprimir Confirmación
          </Button>
        </div>

        {/* Contact Info */}
        <div className="text-center mt-8 text-gray-600">
          <p>¿Necesitas modificar tu reserva?</p>
          <p className="mt-1">
            Contáctanos al <strong>099-999-9999</strong> o{' '}
            <a href="mailto:contacto@restaurante.com" className="text-primary hover:underline">
              contacto@restaurante.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};