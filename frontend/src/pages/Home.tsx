import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Bienvenido a Nuestro Restaurante
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Disfruta de una experiencia gastronómica única. 
            Reserva tu mesa en línea de manera fácil y rápida.
          </p>
          <Link to="/booking">
            <Button variant="primary" className="text-lg px-8 py-4">
              Reservar Ahora
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold mb-2">Menús Variados</h3>
            <p className="text-gray-600">
              Opciones ejecutivas, a la carta y menús de degustación
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="
            text-4xl mb-4">📅</div>
<h3 className="text-xl font-semibold mb-2">Reserva Fácil</h3>
<p className="text-gray-600">
Sistema de reservas en línea simple y rápido
</p>
</div>
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <div className="text-4xl mb-4">🎉</div>
        <h3 className="text-xl font-semibold mb-2">Eventos Especiales</h3>
        <p className="text-gray-600">
          Celebra cumpleaños, aniversarios y ocasiones especiales
        </p>
      </div>
    </div>
  </div>
</div>
);
};