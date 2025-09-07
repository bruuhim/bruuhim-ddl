// src/app/api/files/route.ts
import { google } from 'googleapis';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId') || process.env.GOOGLE_FOLDER_ID;

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });

    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, parents)',
      orderBy: 'folder,name',
    });

    const files = response.data.files || [];

    return Response.json({ files });
  } catch (error) {
    console.error('Error fetching files:', error);
    return Response.json({ error: 'Failed to fetch files' }, { status: 500 });
  }
}
