import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

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
    const path: Array<{ id: string; name: string }> = []
    let currentId: string | undefined = folderId

    while (currentId && currentId !== process.env.NEXT_PUBLIC_GOOGLE_FOLDER_ID) {
      try {
        // 🔧 FIXED: Explicit typing
        const response: any = await drive.files.get({
          fileId: currentId,
          fields: 'id,name,parents',
        })

        if (response.data && response.data.id && response.data.name) {
          path.unshift({
            id: response.data.id,
            name: response.data.name,
          })
          
          // 🔧 FIXED: Proper optional chaining
          currentId = response.data.parents?.[0] || undefined
        } else {
          break
        }
      } catch (fileError) {
        console.error('Error fetching file:', fileError)
        break
      }
    }

    return NextResponse.json({ path })
  } catch (error) {
    console.error('Error fetching folder path:', error)
    return NextResponse.json({ error: 'Failed to fetch folder path' }, { status: 500 })
  }
}
