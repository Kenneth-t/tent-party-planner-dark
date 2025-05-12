
import { Handler } from '@netlify/functions';
import { format, addDays } from 'date-fns';

const handler: Handler = async () => {
  try {
    // In a production environment, this function would use the Google Calendar API
    // with proper server-side authentication to fetch real availability data.
    // For this demo, we'll return mock data
    
    // Current date for reference
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Generate some random booked dates for the next 3 months
    const bookedDates = [];
    for (let i = 0; i < 10; i++) {
      // Generate a random date within the next 90 days
      const randomDays = Math.floor(Math.random() * 90) + 1;
      const bookedDate = addDays(now, randomDays);
      
      // Format date to ISO string for API response
      bookedDates.push(format(bookedDate, 'yyyy-MM-dd'));
    }
    
    // Return the mocked booked dates
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

export { handler };
