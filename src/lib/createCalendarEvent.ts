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

    // ✅ Build credentials from individual env vars
    const credentials = {
      type: 'service_account',
      project_id: 'feest-in-de-tent', // optional: make env var too
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
      universe_domain: 'googleapis.com',
    };

    // ✅ Authenticate with Google
    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    const calendar = google.calendar({ version: 'v3', auth });

    // ✅ Format fields for the event
    const calendarId = '230a68d8aeabc94b901e673f4165ba60fb56a79d51e9cd879384bfb1cbe384c7@group.calendar.google.com';
    const fullAddress = `${address.street || ''} ${address.houseNumber || ''}, ${address.postalCode || ''} ${address.city || ''}, ${address.country || ''}`.trim();
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 2); // 2 full days block

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
    console.error("❌ Google Calendar insert error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create calendar event', details: err.message }),
    };
  }
};

export { handler };