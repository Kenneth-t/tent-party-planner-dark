import { google } from 'googleapis';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

export enum TransferEventStatus {
  TO_APPROVE = 'tent_to_approve',
  CONFIRMED = 'tent_confirmed',
}

interface CreateCalendarEventProps {
  summary?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  tentType: string;
  price: number;
  deliveryCost: number;
  total: number;
  date: Date;
  time: string;
  address: {
    street?: string;
    houseNumber?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    fullAddress: string;
  };
  comments?: string;
  status: TransferEventStatus;
}

export async function createCalendarEvent({
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
  status,
}: CreateCalendarEventProps): Promise<string> {
  const auth = new google.auth.GoogleAuth({
    keyFile: './path-to-your-service-account.json', // update path
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });

  const calendar = google.calendar({ version: 'v3', auth });
  const calendarId = 'your-calendar-id@group.calendar.google.com'; // replace with real ID

  const fullAddress = `${address.street || ''} ${address.houseNumber || ''}, ${address.postalCode || ''} ${address.city || ''}, ${address.country || ''}`.trim();
  const dateStr = format(date, 'dd MMMM yyyy', { locale: nl });
  const title = `${address.street || ''} ${address.houseNumber || ''} - ${customerName} - ${customerEmail}`;

  const startDateTime = new Date(date);
  const endDateTime = new Date(date);
  endDateTime.setDate(endDateTime.getDate() + 2); // Delivery + pickup day

  const event = {
    summary: title,
    description: `
Tenttype: ${tentType}
Datum: ${dateStr}
Tijd: ${time}
Adres: ${fullAddress}
Naam: ${customerName}
Email: ${customerEmail}
Telefoon: ${customerPhone}
Opmerkingen: ${comments || 'Geen'}
Basisprijs: € ${price.toFixed(2)}
Leveringskost: € ${deliveryCost.toFixed(2)}
Totaalprijs: € ${total.toFixed(2)}
Status: ${status}
    `.trim(),
    location: fullAddress,
    start: {
      date: format(startDateTime, 'yyyy-MM-dd'),
    },
    end: {
      date: format(endDateTime, 'yyyy-MM-dd'),
    },
  };

  const response = await calendar.events.insert({
    calendarId,
    requestBody: event,
  });

  return response.data.id!;
}