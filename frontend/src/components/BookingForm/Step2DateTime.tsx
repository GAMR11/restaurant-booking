import React, { useEffect, useRef, useState } from 'react';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { TimeSlot } from '../../types';

interface Step2Props {
  formData: {
    reservationDate: string;
    reservationTime: string;
    reservationEndTime: string;
    numberOfGuests: number;
  };
  errors: Record<string, string>;
  availableSlots: TimeSlot[];
  loading: boolean;
  onChange: (field: string, value: string | number) => void;
  onDateChange: (date: string, guests: number) => void;
}

export const Step2DateTime: React.FC<Step2Props> = ({
  formData,
  errors,
  availableSlots,
  loading,
  onChange,
  onDateChange,
}) => {
  const lastFetchRef = useRef<string>('');
  const timeoutRef = useRef<NodeJS.Timeout>();
  const [isSelectingRange, setIsSelectingRange] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateString = maxDate.toISOString().split('T')[0];

  const guestOptions = Array.from({ length: 20 }, (_, i) => ({
    value: String(i + 1),
    label: `${i + 1} ${i === 0 ? 'persona' : 'personas'}`,
  }));

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (formData.reservationDate && formData.numberOfGuests) {
      const fetchKey = `${formData.reservationDate}-${formData.numberOfGuests}`;
      
      if (lastFetchRef.current === fetchKey) {
        return;
      }

      timeoutRef.current = setTimeout(() => {
        lastFetchRef.current = fetchKey;
        onDateChange(formData.reservationDate, formData.numberOfGuests);
      }, 500);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [formData.reservationDate, formData.numberOfGuests]);

  // Obtener slots seleccionados
  const getSelectedSlots = (): string[] => {
    if (!formData.reservationTime) return [];
    
    if (!formData.reservationEndTime) {
      return [formData.reservationTime];
    }

    const startIdx = availableSlots.findIndex(s => s.time === formData.reservationTime);
    const endIdx = availableSlots.findIndex(s => s.time === formData.reservationEndTime);
    
    if (startIdx === -1 || endIdx === -1) return [formData.reservationTime];
    
    return availableSlots
      .slice(startIdx, endIdx + 1)
      .map(s => s.time);
  };

  const selectedSlots = getSelectedSlots();

  // Manejar click en un slot
  const handleSlotClick = (slot: TimeSlot) => {
    if (!slot.available) return;

    // CASO 1: No hay nada seleccionado -> Seleccionar inicio
    if (!formData.reservationTime) {
      onChange('reservationTime', slot.time);
      onChange('reservationEndTime', slot.time); // Mismo slot = 30 minutos
      setIsSelectingRange(true);
      return;
    }

    // CASO 2: Click en el mismo slot que el inicio -> Deseleccionar todo
    if (slot.time === formData.reservationTime && selectedSlots.length === 1) {
      onChange('reservationTime', '');
      onChange('reservationEndTime', '');
      setIsSelectingRange(false);
      return;
    }

    // CASO 3: Ya hay inicio seleccionado -> Establecer fin
    const startIdx = availableSlots.findIndex(s => s.time === formData.reservationTime);
    const clickedIdx = availableSlots.findIndex(s => s.time === slot.time);

    // Si clickea antes del inicio, reiniciar selección
    if (clickedIdx < startIdx) {
      onChange('reservationTime', slot.time);
      onChange('reservationEndTime', slot.time);
      setIsSelectingRange(true);
      return;
    }

    // Calcular duración
    const duration = (clickedIdx - startIdx + 1) * 0.5;
    const maxDuration = 8;

    if (duration > maxDuration) {
      alert(`⚠️ La duración máxima es ${maxDuration} horas.\nActualmente seleccionaste ${duration} horas.\n\nPor favor selecciona un rango menor.`);
      return;
    }

    // Verificar disponibilidad de todos los slots en el rango
    const slotsInRange = availableSlots.slice(startIdx, clickedIdx + 1);
    const unavailableSlots = slotsInRange.filter(s => 
      !s.available || s.remainingCapacity < formData.numberOfGuests
    );

    if (unavailableSlots.length > 0) {
      alert(`⚠️ Los siguientes horarios no están disponibles:\n${unavailableSlots.map(s => s.time).join(', ')}\n\nPor favor selecciona otro rango.`);
      return;
    }

    // Todo OK -> Establecer fin
    onChange('reservationEndTime', slot.time);
    setIsSelectingRange(false);
  };

  const calculateEndTime = () => {
    if (!formData.reservationEndTime) return formData.reservationTime;
    
    const [endH, endM] = formData.reservationEndTime.split(':').map(Number);
    const endMinutes = endH * 60 + endM + 30; // Sumar 30 minutos
    
    const finalHours = Math.floor(endMinutes / 60);
    const finalMinutes = endMinutes % 60;
    
    return `${String(finalHours).padStart(2, '0')}:${String(finalMinutes).padStart(2, '0')}`;
  };

// Calcular duración REAL entre inicio y fin (sin sumar 30 min extras)
const calculateDuration = () => {
  if (!formData.reservationTime || !formData.reservationEndTime) return '';

  const [startH, startM] = formData.reservationTime.split(':').map(Number);
  const startMinutes = startH * 60 + startM;

  const [endH, endM] = formData.reservationEndTime.split(':').map(Number);
  const endMinutes = endH * 60 + endM;

  // Diferencia exacta SIN sumar 30 minutos
  const durationMinutes = endMinutes - startMinutes;

  // Si es el mismo slot, son 30 minutos
  if (durationMinutes === 0) return '30 minutos';

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  if (hours === 0) return `${minutes} minutos`;
  if (minutes === 0) return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  return `${hours}h ${minutes}min`;
};

// Ya NO necesitamos calculateEndTime(), usamos directamente reservationEndTime

  // Resetear selección
  const handleReset = () => {
    onChange('reservationTime', '');
    onChange('reservationEndTime', '');
    setIsSelectingRange(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Fecha y Hora de la Reserva
      </h2>

      <Select
        label="Número de personas"
        value={String(formData.numberOfGuests)}
        onChange={(e) => {
          onChange('numberOfGuests', parseInt(e.target.value));
          // Resetear selección al cambiar número de personas
          handleReset();
        }}
        options={guestOptions}
        error={errors.numberOfGuests}
        required
      />

      <Input
        label="Fecha de la reserva"
        type="date"
        value={formData.reservationDate}
        onChange={(e) => {
          onChange('reservationDate', e.target.value);
          // Resetear selección al cambiar fecha
          handleReset();
        }}
        error={errors.reservationDate}
        min={today}
        max={maxDateString}
        required
      />

      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-gray-600 mt-2">Cargando disponibilidad...</p>
        </div>
      )}

      {!loading && availableSlots.length > 0 && (
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Horario disponible
            <span className="text-red-500 ml-1">*</span>
          </label>

          {/* Instrucciones */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4">
            <p className="text-sm text-blue-700">
              <strong>📋 Instrucciones:</strong>
            </p>
            <ol className="text-sm text-blue-700 mt-2 ml-4 list-decimal space-y-1">
              <li>Click en el horario de <strong>inicio</strong></li>
              <li>Click en el horario de <strong>fin</strong> (puedes reservar hasta 8 horas)</li>
              <li>Click en "Resetear" para empezar de nuevo</li>
            </ol>
          </div>

          {/* Duración seleccionada */}
          {selectedSlots.length > 0 && (
            <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
              <div className="space-y-2">
                {/* Línea principal */}
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-green-800">
                      ✅ Reserva: 
                    </span>
                    <span className="ml-2 text-green-700 font-bold text-lg">
                      {formData.reservationTime} - {formData.reservationEndTime}
                    </span>
                    <span className="ml-2 text-green-600 font-semibold">
                      ({calculateDuration()})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
                  >
                    🔄 Resetear
                  </button>
                </div>
                
                {/* Línea de aclaración */}
                <div className="text-sm text-green-700 flex justify-between items-center">
                  <span>
                    📍 <strong>{selectedSlots.length}</strong> turnos seleccionados
                  </span>
                  <span className="text-xs bg-green-100 px-2 py-1 rounded">
                    Cada turno = 30 minutos
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Grid de slots */}
          <div className="grid grid-cols-4 gap-2 max-h-[500px] overflow-y-auto p-2 border rounded">
            {availableSlots.map((slot) => {
              const isSelected = selectedSlots.includes(slot.time);
              const isStart = slot.time === formData.reservationTime;
              const isEnd = slot.time === formData.reservationEndTime && formData.reservationEndTime !== formData.reservationTime;

              return (
                <button
                  key={slot.time}
                  type="button"
                  onClick={() => handleSlotClick(slot)}
                  disabled={!slot.available}
                  className={`p-3 rounded-lg border-2 transition-all text-sm ${
                    isStart
                      ? 'border-green-500 bg-green-500 text-white font-bold shadow-lg'
                      : isEnd
                      ? 'border-blue-500 bg-blue-500 text-white font-bold shadow-lg'
                      : isSelected
                      ? 'border-primary bg-primary text-white'
                      : slot.available
                      ? 'border-gray-300 hover:border-primary hover:bg-gray-50 cursor-pointer'
                      : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <div className="font-semibold">
                    {slot.time}
                  </div>
                  {isStart && <div className="text-xs mt-1">🚀 Inicio</div>}
                  {isEnd && <div className="text-xs mt-1">🏁 Fin</div>}
                  {slot.available && !isStart && !isEnd && (
                    <div className="text-xs mt-1 opacity-75">
                      {slot.remainingCapacity} disp.
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {errors.reservationTime && (
            <p className="text-red-500 text-sm mt-2">{errors.reservationTime}</p>
          )}
        </div>
      )}

      {!loading && formData.reservationDate && availableSlots.length === 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
          <p className="text-yellow-700">
            No hay disponibilidad para esta fecha. Por favor selecciona otra fecha.
          </p>
        </div>
      )}
    </div>
  );

  
};