import React from 'react';
import { Select } from '../common';

interface Step3Props {
  formData: {
    menuType: string;
    theme?: string;
    tablePreference?: string;
    specialRequests?: string;
    dietaryRestrictions?: string;
  };
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
}

export const Step3Details: React.FC<Step3Props> = ({
  formData,
  errors,
  onChange,
}) => {
  const menuOptions = [
    { value: 'ejecutivo', label: 'Menú Ejecutivo' },
    { value: 'a_la_carta', label: 'A la Carta' },
    { value: 'degustacion', label: 'Menú Degustación' },
    { value: 'especial', label: 'Menú Especial' },
  ];

  const themeOptions = [
    { value: 'ninguno', label: 'Sin temática especial' },
    { value: 'cumpleanos', label: 'Cumpleaños' },
    { value: 'aniversario', label: 'Aniversario' },
    { value: 'negocios', label: 'Comida de Negocios' },
    { value: 'romantica', label: 'Cena Romántica' },
    { value: 'familiar', label: 'Reunión Familiar' },
  ];

  const tableOptions = [
    { value: 'sin_preferencia', label: 'Sin preferencia' },
    { value: 'ventana', label: 'Mesa junto a la ventana' },
    { value: 'terraza', label: 'Terraza' },
    { value: 'interior', label: 'Interior' },
    { value: 'privado', label: 'Área privada' },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Detalles de la Reserva
      </h2>

      <Select
        label="Tipo de menú"
        value={formData.menuType}
        onChange={(e) => onChange('menuType', e.target.value)}
        options={menuOptions}
        error={errors.menuType}
        required
      />

      <Select
        label="Ocasión especial"
        value={formData.theme || ''}
        onChange={(e) => onChange('theme', e.target.value)}
        options={themeOptions}
      />

      <Select
        label="Preferencia de mesa"
        value={formData.tablePreference || ''}
        onChange={(e) => onChange('tablePreference', e.target.value)}
        options={tableOptions}
      />

      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">
          Restricciones alimentarias
        </label>
        <textarea
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          rows={3}
          value={formData.dietaryRestrictions || ''}
          onChange={(e) => onChange('dietaryRestrictions', e.target.value)}
          placeholder="Ej: Alérgico a mariscos, vegetariano, sin gluten..."
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">
          Solicitudes especiales
        </label>
        <textarea
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          rows={4}
          value={formData.specialRequests || ''}
          onChange={(e) => onChange('specialRequests', e.target.value)}
          placeholder="Ej: Necesito silla alta para bebé, decoración especial, etc."
        />
      </div>
    </div>
  );
};