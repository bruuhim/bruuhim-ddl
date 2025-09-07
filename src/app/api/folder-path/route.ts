import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const folderId = searchParams.get('folderId')
    const rootFolderId = process.env.GOOGLE_FOLDER_ID

    if (!folderId || folderId === rootFolderId) {
      return NextResponse.json({ path: [] })
    }

    // Set up Google Drive API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    })

    const drive = google.drive({ version: 'v3', auth })

    // Build path by traversing up the folder hierarchy
    const path: { id: string; name: string }[] = []
    let currentFolderId = folderId

    while (currentFolderId && currentFolderId !== rootFolderId) {
      try {
        const response = await drive.files.get({
          fileId: currentFolderId,
          fields: 'id,name,parents'
        })

        const folder = response.data
        if (folder.name && folder.id) {
          path.unshift({
            id: folder.id,
            name: folder.name
          })
        }

        // Move to parent folder
        currentFolderId = folder.parents?.[0] || ''
      } catch (err) {
        console.error('Error getting folder info:', err)
        break
      }
    }

    return NextResponse.json({ path })

  } catch (error) {
    console.error('Error building folder path:', error)
    return NextResponse.json(
      { error: 'Failed to build folder path' },
      { status: 500 }
    )
  }
}
