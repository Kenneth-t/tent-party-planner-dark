import { Handler } from '@netlify/functions';

const handler: Handler = async () => {
  try {
    console.log("🔎 RAW:", process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.slice?.(0, 80));

    const parsed = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!);

    return {
      statusCode: 200,
      body: JSON.stringify({ client_email: parsed.client_email }),
    };
  } catch (err: any) {
    console.error("❌ Failed to parse env:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

export { handler };