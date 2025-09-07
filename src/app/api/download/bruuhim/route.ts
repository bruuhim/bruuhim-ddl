import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '../../../../utils/encryption'

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    // 🔓 Turn encrypted token back into real Google Drive ID
    const realFileId = decrypt(decodeURIComponent(params.token))
    
    // 🔗 Create real Google Drive download link
    const realDownloadUrl = `https://drive.google.com/uc?export=download&id=${realFileId}&confirm=t`
    
    // ➡️ Send user to real Google Drive
    return NextResponse.redirect(realDownloadUrl)
  } catch (error) {
    // ❌ If token is fake/broken, show error
    return NextResponse.json({ error: 'Link is broken or expired' }, { status: 400 })
  }
}
