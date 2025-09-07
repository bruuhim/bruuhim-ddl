import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fileId = searchParams.get('fileId')
  
  if (!fileId) {
    return NextResponse.json({ error: 'File ID required' }, { status: 400 })
  }

  try {
    // Fetch video from Google Drive
    const driveResponse = await fetch(
      `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'video/webm,video/ogg,video/*;q=0.9,application/ogg;q=0.7,audio/*;q=0.6,*/*;q=0.5',
          'Accept-Encoding': 'identity',
          'Range': request.headers.get('range') || 'bytes=0-',
        },
      }
    )

    if (!driveResponse.ok) {
      throw new Error(`Failed to fetch video: ${driveResponse.status}`)
    }

    // Get content info
    const contentLength = driveResponse.headers.get('content-length')
    const contentType = driveResponse.headers.get('content-type') || 'video/mp4'
    
    // Create response headers
    const responseHeaders = new Headers({
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Range, Content-Length',
      'Cache-Control': 'public, max-age=3600',
    })

    if (contentLength) {
      responseHeaders.set('Content-Length', contentLength)
    }

    // Handle range requests for video seeking
    const range = request.headers.get('range')
    if (range && contentLength) {
      const parts = range.replace(/bytes=/, '').split('-')
      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : parseInt(contentLength) - 1
      const chunksize = (end - start) + 1
      
      responseHeaders.set('Content-Range', `bytes ${start}-${end}/${contentLength}`)
      responseHeaders.set('Content-Length', chunksize.toString())
      
      return new NextResponse(driveResponse.body, {
        status: 206,
        headers: responseHeaders,
      })
    }

    return new NextResponse(driveResponse.body, {
      headers: responseHeaders,
    })

  } catch (error) {
    console.error('Video proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to proxy video' }, 
      { status: 500 }
    )
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Range, Content-Length',
    },
  })
}
