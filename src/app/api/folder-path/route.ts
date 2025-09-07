// src/app/api/folder-path/route.ts
import { google } from 'googleapis';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId');
    
    if (!folderId || folderId === process.env.GOOGLE_FOLDER_ID) {
      return Response.json([]);
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });

    const path: { id: string; name: string }[] = [];
    let currentId = folderId;
    const rootFolderId = process.env.GOOGLE_FOLDER_ID;

    while (currentId && currentId !== rootFolderId) {
      const response = await drive.files.get({
        fileId: currentId,
        fields: 'id, name, parents',
      });

      const file = response.data;
      if (file.name && file.id) {
        path.unshift({ id: file.id, name: file.name });
      }

      currentId = file.parents?.[0];
    }

    return Response.json(path);
  } catch (error) {
    console.error('Error fetching folder path:', error);
    return Response.json([]);
  }
}
