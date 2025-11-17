import React from 'react';
import { Input } from '../common/Input';

interface Step1Props {
  formData: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  };
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
}

export const Step1PersonalInfo: React.FC<Step1Props> = ({
  formData,
  errors,
  onChange,
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Información Personal
      </h2>

      <Input
        label="Nombre completo"
        type="text"
        value={formData.customerName}
        onChange={(e) => onChange('customerName', e.target.value)}
        error={errors.customerName}
        placeholder="Ej: Juan Pérez"
        required
      />

      <Input
        label="Correo electrónico"
        type="email"
        value={formData.customerEmail}
        onChange={(e) => onChange('customerEmail', e.target.value)}
        error={errors.customerEmail}
        placeholder="ejemplo@correo.com"
        required
      />

      <Input
        label="Teléfono"
        type="tel"
        value={formData.customerPhone}
        onChange={(e) => onChange('customerPhone', e.target.value)}
        error={errors.customerPhone}
        placeholder="0999999999"
        required
      />

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-6">
        <p className="text-sm text-blue-700">
          <strong>Nota:</strong> Recibirás la confirmación de tu reserva por correo electrónico.
        </p>
      </div>
    </div>
  );
};