import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { encrypt } from '../../../utils/encryption'

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
})

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const folderId = searchParams.get('folderId')

  if (!folderId) {
    return NextResponse.json({ error: 'Folder ID is required' }, { status: 400 })
  }

  try {
    const drive = google.drive({ version: 'v3', auth })
    
    // Use folder ID directly (don't try to decrypt on first load)
    let realFolderId = folderId
    
    // Only try to decrypt if it looks like an encrypted token
    if (folderId.includes(':') || folderId.length > 50) {
      try {
        const { decrypt } = await import('../../../utils/encryption')
        realFolderId = decrypt(decodeURIComponent(folderId))
      } catch (e) {
        console.log('Decryption failed, using original ID')
        realFolderId = folderId
      }
    }
    
    const response = await drive.files.list({
      q: `'${realFolderId}' in parents and trashed = false`,
      fields: 'files(id,name,mimeType,size,modifiedTime,parents)',
      orderBy: 'name',
    })

    // ENCRYPT all file IDs before sending to frontend
    const files = response.data.files?.map(file => ({
      ...file,
      id: encrypt(file.id!),
    })) || []

    return NextResponse.json({ files })
  } catch (error) {
    console.error('Error fetching files:', error)
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 })
  }
}
