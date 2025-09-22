import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { decryptFileId } from '@/utils/encryption';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const encryptedId = searchParams.get('id');

  if (!encryptedId) {
    return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
  }

  try {
    // Decrypt the file ID
    const fileId = decryptFileId(encryptedId);

    const drive = google.drive({ version: 'v3', auth });

    // Get file metadata first
    const file = await drive.files.get({
      fileId,
      fields: 'id,name,mimeType,size',
    });

    const { name, mimeType, size } = file.data;

    // Get the file content
    const response = await drive.files.get(
      {
        fileId,
        alt: 'media',
      },
      { responseType: 'stream' }
    );

    // Create headers for streaming response
    const headers = new Headers({
      'Content-Type': mimeType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(name || 'file')}"`,
      'Cache-Control': 'public, max-age=3600',
    });

    if (size) {
      headers.set('Content-Length', size.toString());
    }

    // Create a TransformStream to pipe the file data through
    const { readable, writable } = new TransformStream();

    // Pipe the Google Drive response to our transform stream
    response.data.pipe(writable);

    // Return a streaming response
    return new NextResponse(readable, {
      headers,
    });
  } catch (error: any) {
    console.error('Error downloading file:', error);

    if (error.message?.includes('invalid encrypted data')) {
      return NextResponse.json({ error: 'Invalid file ID' }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    );
  }
}