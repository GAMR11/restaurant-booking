// Cargar variables de entorno
require('dotenv').config();

const { google } = require('googleapis');

console.log('🔍 Verificando variables de entorno...');
console.log('GOOGLE_CLIENT_EMAIL:', process.env.GOOGLE_CLIENT_EMAIL ? '✅ Cargado' : '❌ No encontrado');
console.log('GOOGLE_PRIVATE_KEY:', process.env.GOOGLE_PRIVATE_KEY ? '✅ Cargado' : '❌ No encontrado');
console.log('GOOGLE_CALENDAR_ID:', process.env.GOOGLE_CALENDAR_ID ? '✅ Cargado' : '❌ No encontrado');
console.log('');

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/calendar'],
});

const calendar = google.calendar({ version: 'v3', auth });

async function testCalendar() {
  try {
    console.log('📅 Intentando conectar con Google Calendar...');
    console.log('Calendar ID:', process.env.GOOGLE_CALENDAR_ID);
    
    const response = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
      timeMin: new Date().toISOString(),
    });
    
    console.log('✅ ¡Conexión exitosa con Google Calendar!');
    console.log('📊 Número de eventos próximos:', response.data.items.length);
    
    if (response.data.items.length > 0) {
      console.log('\n📋 Próximos eventos:');
      response.data.items.forEach((event, i) => {
        console.log(`${i + 1}. ${event.summary} - ${event.start.dateTime || event.start.date}`);
      });
    } else {
      console.log('📭 No hay eventos próximos en el calendario.');
    }
    
    // Intentar crear un evento de prueba
    console.log('\n🧪 Intentando crear un evento de prueba...');
    
    const testEvent = {
      summary: 'Prueba de Reserva - Sistema Restaurante',
      description: 'Este es un evento de prueba para verificar la integración con Google Calendar API',
      start: {
        dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Mañana a esta hora
        timeZone: 'America/Bogota',
      },
      end: {
        dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // 2 horas después
        timeZone: 'America/Bogota',
      },
    };
    
    const createdEvent = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      requestBody: testEvent,
    });
    
    console.log('✅ ¡Evento de prueba creado exitosamente!');
    console.log('🔗 Link del evento:', createdEvent.data.htmlLink);
    console.log('🆔 ID del evento:', createdEvent.data.id);
    
    // Opcional: Eliminar el evento de prueba después de 5 segundos
    console.log('\n🗑️  Eliminando evento de prueba en 50 segundos...');
    setTimeout(async () => {
      try {
        await calendar.events.delete({
          calendarId: process.env.GOOGLE_CALENDAR_ID,
          eventId: createdEvent.data.id,
        });
        console.log('✅ Evento de prueba eliminado correctamente.');
      } catch (err) {
        console.error('❌ Error al eliminar evento:', err.message);
      }
    }, 50000);
    
  } catch (error) {
    console.error('❌ Error al conectar con Google Calendar:');
    console.error('Código de error:', error.code);
    console.error('Mensaje:', error.message);
    
    if (error.code === 404) {
      console.error('\n💡 Posible causa: El calendario no existe o el Calendar ID es incorrecto.');
    } else if (error.code === 403) {
      console.error('\n💡 Posible causa: La service account no tiene permisos en el calendario.');
      console.error('   Asegúrate de haber compartido el calendario con:', process.env.GOOGLE_CLIENT_EMAIL);
    } else if (error.code === 401) {
      console.error('\n💡 Posible causa: Credenciales inválidas.');
      console.error('   Verifica que GOOGLE_CLIENT_EMAIL y GOOGLE_PRIVATE_KEY sean correctos.');
    }
  }
}

testCalendar();