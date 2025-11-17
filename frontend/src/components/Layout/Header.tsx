import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-2xl font-bold">Restaurante</h1>
      </div>
    </header>
  );
};