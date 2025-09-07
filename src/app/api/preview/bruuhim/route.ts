import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '../../../../utils/encryption'

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    // 🔓 DECRYPT the file ID  
    const fileId = decrypt(decodeURIComponent(params.token))
    
    // Redirect to real Google Drive preview
    const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`
    
    return NextResponse.redirect(previewUrl)
  } catch (error) {
    console.error('Decryption error:', error)
    return NextResponse.json({ error: 'Invalid or expired link' }, { status: 400 })
  }
}
