import { google } from 'googleapis';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const docId = searchParams.get('docId');

  if (!docId) {
    return new Response(JSON.stringify({ error: 'Missing document ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: 'whitenew@apitest-442404.iam.gserviceaccount.com',
        private_key: process.env.NEXT_PUBLIC_GOOGLE_DOCS.replace(/\\n/g, '\n'),
      },
      scopes: [
        'https://www.googleapis.com/auth/documents',
        'https://www.googleapis.com/auth/drive.file'
      ]
    });

    console.log();

    const docs = google.docs({ version: 'v1', auth });
    const response = await docs.documents.get({ documentId: docId });

    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching Google Docs:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch document' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
