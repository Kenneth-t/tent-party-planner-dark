
import { Handler } from '@netlify/functions';
import { google } from 'googleapis';
import { format, addDays, startOfMonth, endOfMonth, parseISO } from 'date-fns';

const handler: Handler = async (event) => {
  try {
    // Parse request parameters (if any)
    const queryStringParameters = event.queryStringParameters || {};
    const requestedMonth = queryStringParameters.month 
      ? parseInt(queryStringParameters.month, 10)
      : new Date().getMonth();
    const requestedYear = queryStringParameters.year
      ? parseInt(queryStringParameters.year, 10)
      : new Date().getFullYear();
    
    // Initialize date range for the requested month
    const startDate = startOfMonth(new Date(requestedYear, requestedMonth));
    const endDate = endOfMonth(new Date(requestedYear, requestedMonth));
    
    // Check if Google Service Account credentials are available
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      console.log("⚠️ No Google Service Account key found, returning mock data");
      
      // Fall back to mock data
      const bookedDates = generateMockBookedDates();
      return {
        statusCode: 200,
        body: JSON.stringify({ bookedDates }),
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
        }
      };
    }
    
    // Parse the service account key from environment variable
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);

    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    });

    const calendar = google.calendar({ version: 'v3', auth });
    const calendarId = '230a68d8aeabc94b901e673f4165ba60fb56a79d51e9cd879384bfb1cbe384c7@group.calendar.google.com';

    // Fetch events from Google Calendar
    const response = await calendar.events.list({
      calendarId,
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    // Extract dates from events
    const bookedDates = (response.data.items || [])
      .filter(event => event.start && (event.start.date || event.start.dateTime))
      .map(event => {
        // Handle all-day events (date) or timed events (dateTime)
        const startDate = event.start.date || event.start.dateTime;
        return format(parseISO(startDate), 'yyyy-MM-dd');
      });

    // Return the booked dates
    return {
      statusCode: 200,
      body: JSON.stringify({ bookedDates }),
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    };
    
  } catch (err: any) {
    console.error("Failed to get availability:", err);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Error fetching availability',
        message: err.message
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  }
};

// Function to generate mock booked dates (used as fallback)
function generateMockBookedDates(): string[] {
  const now = new Date();
  const bookedDates = [];
  
  for (let i = 0; i < 10; i++) {
    // Generate a random date within the next 90 days
    const randomDays = Math.floor(Math.random() * 90) + 1;
    const bookedDate = addDays(now, randomDays);
    
    // Format date to ISO string for API response
    bookedDates.push(format(bookedDate, 'yyyy-MM-dd'));
  }
  
  return bookedDates;
}

export { handler };
