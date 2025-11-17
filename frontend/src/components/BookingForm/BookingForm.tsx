import React, { useState, useCallback  } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../hooks/useBooking';
import { ReservationFormData } from '../../types';
import { Button } from '../common/Button';
import { Step1PersonalInfo } from './Step1PersonalInfo';
import { Step2DateTime } from './Step2DateTime';
import { Step3Details } from './Step3Details';
import { Step4Confirmation } from './Step4Confirmation';

export const BookingForm: React.FC = () => {
  const navigate = useNavigate();
  const { loading, error, availableSlots, fetchAvailability, createReservation } = useBooking();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ReservationFormData>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    reservationDate: '',
    reservationTime: '',
    reservationEndTime: '', // ✅ NUEVO
    numberOfGuests: 2,
    menuType: '',
    theme: '',
    tablePreference: '',
    specialRequests: '',
    dietaryRestrictions: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario escribe
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // const handleDateChange = async (date: string, guests: number) => {
  //   if (date && guests) {
  //     await fetchAvailability(date, guests);
  //   }
  // };
  const handleDateChange = useCallback(async (date: string, guests: number) => {
    if (date && guests) {
      await fetchAvailability(date, guests);
    }
  }, [fetchAvailability]);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.customerName.trim()) {
          newErrors.customerName = 'El nombre es requerido';
        }
        if (!formData.customerEmail.trim()) {
          newErrors.customerEmail = 'El correo es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
          newErrors.customerEmail = 'Correo inválido';
        }
        if (!formData.customerPhone.trim()) {
          newErrors.customerPhone = 'El teléfono es requerido';
        } else if (!/^[0-9]{10}$/.test(formData.customerPhone.replace(/\s/g, ''))) {
          newErrors.customerPhone = 'Teléfono inválido (10 dígitos)';
        }
        break;

      case 2:
        if (!formData.reservationDate) {
          newErrors.reservationDate = 'La fecha es requerida';
        }
        if (!formData.reservationTime) {
          newErrors.reservationTime = 'El horario de inicio es requerido';
        }
        if (!formData.numberOfGuests || formData.numberOfGuests < 1) {
          newErrors.numberOfGuests = 'El número de personas es requerido';
        }
        break;

      case 3:
        if (!formData.menuType) {
          newErrors.menuType = 'Debe seleccionar un tipo de menú';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    try {
      const response = await createReservation(formData);
      // Redirigir a página de confirmación con el ID de la reserva
      navigate(`/confirmation/${response.data.id}`);
    } catch (err) {
      console.error('Error al crear reserva:', err);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1PersonalInfo
            formData={formData}
            errors={errors}
            onChange={handleChange}
          />
        );
      case 2:
        return (
          <Step2DateTime
            formData={formData}
            errors={errors}
            availableSlots={availableSlots}
            loading={loading}
            onChange={handleChange}
            onDateChange={handleDateChange}
          />
        );
      case 3:
        return (
          <Step3Details
            formData={formData}
            errors={errors}
            onChange={handleChange}
          />
        );
      case 4:
        return <Step4Confirmation formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`flex-1 h-2 rounded-full mx-1 ${
                step <= currentStep ? 'bg-primary' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Info Personal</span>
          <span>Fecha y Hora</span>
          <span>Detalles</span>
          <span>Confirmar</span>
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        {renderStep()}

        {/* Error Message */}
        {error && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || loading}
          >
            Atrás
          </Button>

          {currentStep < 4 ? (
            <Button onClick={handleNext} disabled={loading}>
              Siguiente
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              isLoading={loading}
              disabled={loading}
            >
              Confirmar Reserva
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};