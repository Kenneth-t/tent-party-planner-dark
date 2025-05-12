import { google } from 'googleapis';
import { format } from 'date-fns';

export enum TransferEventStatus {
  TO_APPROVE = 'TO_APPROVE',
  APPROVED = 'APPROVED',
}

export interface CalendarEvent {
  summary: string;
  description: string;
  location: string;
  startDateTime: Date;
  endDateTime: Date;
  status: TransferEventStatus;
}

export async function createCalendarEvent(eventDetails: CalendarEvent): Promise<string> {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!);
  console.log("this is the key:" + credentials);

  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });

  const calendar = google.calendar({ version: 'v3', auth });

  const calendarId = '230a68d8aeabc94b901e673f4165ba60fb56a79d51e9cd879384bfb1cbe384c7@group.calendar.google.com';

  const event = {
    summary: eventDetails.summary,
    description: eventDetails.description,
    location: eventDetails.location,
    start: {
      dateTime: eventDetails.startDateTime.toISOString(),
      timeZone: 'Europe/Brussels',
    },
    end: {
      dateTime: eventDetails.endDateTime.toISOString(),
      timeZone: 'Europe/Brussels',
    },
  };

  try {
    const response = await calendar.events.insert({
      calendarId,
      requestBody: event,
    });

    console.log("✅ Event created:", response.data.id);
    return response.data.id!;
  } catch (error) {
    console.error("❌ Failed to create calendar event:", error);
    throw error;
  }
}