import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { decryptFileId } from '@/utils/encryption';
import { Readable } from 'stream';

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

    // Get the file content as a Node.js stream
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

    // Convert the Node.js stream to a Web API stream
    const stream = Readable.toWeb(response.data);

    // Return a streaming response with the converted Web API stream
    return new NextResponse(stream, {
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