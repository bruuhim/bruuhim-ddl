import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { encrypt, decrypt } from '../../../utils/encryption'

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
    
    // Decrypt folder ID
    let realFolderId = folderId
    try {
      realFolderId = decrypt(decodeURIComponent(folderId))
    } catch (e) {
      realFolderId = folderId
    }

    const path: any[] = []
    let currentId: string | undefined = realFolderId

    while (currentId && currentId !== process.env.NEXT_PUBLIC_GOOGLE_FOLDER_ID) {
      const response = await drive.files.get({
        fileId: currentId,
        fields: 'id,name,parents',
      })

      if (response.data && response.data.id && response.data.name) {
        path.unshift({
          id: encrypt(response.data.id),
          name: response.data.name,
        })
        // 🔧 FIXED: Handle undefined parents properly
        currentId = response.data.parents && response.data.parents.length > 0 
          ? response.data.parents[0] 
          : undefined
      } else {
        break
      }
    }

    return NextResponse.json({ path })
  } catch (error) {
    console.error('Error fetching folder path:', error)
    return NextResponse.json({ error: 'Failed to fetch folder path' }, { status: 500 })
  }
}
