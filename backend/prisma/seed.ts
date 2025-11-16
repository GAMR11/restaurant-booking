/// <reference types="node" />

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient() as any; 

async function main() {
  console.log('Iniciando el sembrado de datos...');

  // 1. Verificar si ya existe una configuración para evitar duplicados
  const existingSettings = await prisma['restaurantSettings'].findFirst(); 

  if (!existingSettings) {
    // 2. Insertar la configuración inicial si no existe ninguna
    await prisma['restaurantSettings'].create({
      data: {
        maxGuestsPerSlot: 10,  // Capacidad máxima de reservas por turno
        slotDuration: 30,      // Duración de cada turno en minutos (ej: 30 minutos)
        openingTime: '07:00',  // Hora de apertura (formato HH:MM)
        closingTime: '24:00',  // Hora de cierre (formato HH:MM)
        daysAdvanceBooking: 90, // Días de anticipación para reservar
      },
    });
    console.log('✅ Configuración del restaurante insertada correctamente.');
  } else {
    console.log('⏩ La configuración del restaurante ya existe. Saltando el sembrado.');
  }

  // 3. (Opcional, pero recomendado): Añadir una mesa de ejemplo para pruebas
  // CORRECCIÓN: Cambiamos a 'table' (singular) ya que definimos el modelo 'Table'
  const existingTable = await prisma['table'].findFirst(); 

  if (!existingTable) {
    await prisma['table'].create({
      data: {
        number: 10,
        capacity: 4, // Mesa con capacidad para 4 personas
      }
    });
    console.log('✅ Mesa de ejemplo insertada (Tabla 10).');
  } else {
     console.log('⏩ Mesa de ejemplo ya existe. Saltando el sembrado.');
  }


}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect(); 
  });