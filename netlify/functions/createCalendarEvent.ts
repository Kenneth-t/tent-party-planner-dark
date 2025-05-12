// netlify/functions/createCalendarEvent.ts
import { Handler } from '@netlify/functions';
import { google } from 'googleapis';
import { format } from 'date-fns';

const handler: Handler = async (event) => {
  try {
    const data = JSON.parse(event.body || '{}');

    const {
      customerName,
      customerEmail,
      customerPhone,
      tentType,
      price,
      deliveryCost,
      total,
      date,
      time,
      address,
      comments,
      status
    } = data;

    const credentials = JSON.parse(JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!));

    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    const calendar = google.calendar({ version: 'v3', auth });

    const calendarId = '230a68d8aeabc94b901e673f4165ba60fb56a79d51e9cd879384bfb1cbe384c7@group.calendar.google.com';

    const fullAddress = `${address.street || ''} ${address.houseNumber || ''}, ${address.postalCode || ''} ${address.city || ''}, ${address.country || ''}`.trim();

    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 2); // block 2 days

    const summary = `${address.street || ''} ${address.houseNumber || ''} - ${customerName} - ${customerEmail}`;
    const description = `
Tenttype: ${tentType}
Datum: ${format(new Date(date), 'dd MMMM yyyy')}
Tijd: ${time}
Adres: ${fullAddress}
Naam: ${customerName}
Email: ${customerEmail}
Telefoon: ${customerPhone}
Opmerkingen: ${comments || 'Geen'}
Basisprijs: €${price.toFixed(2)}
Leveringskost: €${deliveryCost.toFixed(2)}
Totaalprijs: €${total.toFixed(2)}
Status: ${status}
    `.trim();

    const response = await calendar.events.insert({
      calendarId,
      requestBody: {
        summary,
        location: fullAddress,
        description,
        start: { date: format(startDate, 'yyyy-MM-dd') },
        end: { date: format(endDate, 'yyyy-MM-dd') },
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ eventId: response.data.id }),
    };
  } catch (err: any) {
    console.error("Google Calendar insert error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create calendar event', details: err.message }),
    };
  }
};

export { handler };