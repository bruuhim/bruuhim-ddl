'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

/* ────────────────────────────────────────────
   Types
────────────────────────────────────────────── */
interface DriveFile {
  id: string
  name: string
  mimeType: string
  size?: string
  modifiedTime: string
}

interface FolderPathItem {
  id: string
  name: string
}

/* ────────────────────────────────────────────
   Component
────────────────────────────────────────────── */
export default function Home() {
  /* State */
  const [files,        setFiles]        = useState<DriveFile[]>([])
  const [loading,      setLoading]      = useState(true)
  const [folderPath,   setFolderPath]   = useState<FolderPathItem[]>([])
  const [currentId,    setCurrentId]    = useState<string>('')
  const [previewFile,  setPreviewFile]  = useState<DriveFile | null>(null)

  /* Initial fetch */
  useEffect(() => {
    const folderId =
      new URLSearchParams(window.location.search).get('folder') ||
      process.env.NEXT_PUBLIC_GOOGLE_FOLDER_ID ||
      ''
    setCurrentId(folderId)
    fetchFiles(folderId)
    fetchPath(folderId)

    const popHandler = () => {
      const id =
        new URLSearchParams(window.location.search).get('folder') ||
        process.env.NEXT_PUBLIC_GOOGLE_FOLDER_ID ||
        ''
      setCurrentId(id)
      fetchFiles(id)
      fetchPath(id)
    }
    window.addEventListener('popstate', popHandler)
    return () => window.removeEventListener('popstate', popHandler)
  }, [])

  /* Helpers */
  const fetchFiles = async (id: string) => {
    setLoading(true)
    try {
      const res  = await fetch(`/api/files?folderId=${id}`)
      const data = await res.json()
      setFiles(data.files || [])
    } catch {
      setFiles([])
    }
    setLoading(false)
  }

  const fetchPath = async (id: string) => {
    try {
      const res  = await fetch(`/api/folder-path?folderId=${id}`)
      const data = await res.json()
      setFolderPath(data.path || [])
    } catch {
      setFolderPath([])
    }
  }

  const isFolder      = (f: DriveFile) => f.mimeType === 'application/vnd.google-apps.folder'
  const isVideoFile   = (f: DriveFile) => ['mp4','mkv','avi','mov','webm'].includes(ext(f))
  const isImageFile   = (f: DriveFile) => ['jpg','jpeg','png','gif','webp'].includes(ext(f))
  const ext           = (f: DriveFile) => f.name.split('.').pop()?.toLowerCase() || ''
  const dlUrl         = (f: DriveFile) => `https://drive.google.com/uc?export=download&id=${f.id}`
  const previewUrl    = (f: DriveFile) => `https://drive.google.com/file/d/${f.id}/preview`
  const directLink    = (f: DriveFile) => `https://drive.google.com/file/d/${f.id}/view`

  const fmtSize = (b?: string) => {
    if (!b) return ''
    let s = parseInt(b), u = 0, units = ['B','KB','MB','GB','TB']
    while (s >= 1024 && u < units.length - 1) { s /= 1024; u++ }
    return `${s.toFixed(1)} ${units[u]}`
  }

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })

  const icon = (f: DriveFile) =>
    isFolder(f) ? '📁' :
    isVideoFile(f) ? '🎬' :
    isImageFile(f) ? '🖼️'  :
    '📄'

  /* Render */
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-inter">

      {/* ───────── Header ───────── */}
      <header className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex justify-between">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-light">
            Bruuhim <span className="font-normal text-slate-400">DDL</span>
          </h1>
          <a href="https://x.com/bruuhim" target="_blank" className="text-slate-400 hover:text-slate-200 text-sm">@bruuhim</a>
        </div>
      </header>

      {/* ───────── Main ───────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">

        {/* Breadcrumb */}
        {folderPath.length > 0 &&
          <nav className="mb-6 text-sm overflow-x-auto">
            <ol className="flex items-center space-x-2">
              <li>
                <button
                  onClick={() => { window.history.pushState({},'','/'); fetchFiles(process.env.NEXT_PUBLIC_GOOGLE_FOLDER_ID||''); fetchPath(process.env.NEXT_PUBLIC_GOOGLE_FOLDER_ID||'') }}
                  className="text-slate-400 hover:text-slate-200"
                >Home</button>
              </li>
              {folderPath.map(f => (
                <li key={f.id} className="flex items-center">
                  <span className="mx-1 text-slate-600">{'>'}</span>
                  <button
                    onClick={() => { window.history.pushState({},'',`/?folder=${f.id}`); fetchFiles(f.id); fetchPath(f.id) }}
                    className="text-slate-400 hover:text-slate-200 whitespace-nowrap"
                  >{f.name}</button>
                </li>
              ))}
            </ol>
          </nav>}

        {/* File list */}
        {loading ? (
          <p className="text-center text-slate-400 py-20">Loading…</p>
        ) : (
          <div className="divide-y divide-slate-800/50 rounded-2xl border border-slate-800/50 bg-slate-900/30">
            {files.length === 0 &&
              <p className="py-16 text-center text-slate-500">This folder is empty</p>}
            {files.map(f => (
              <div key={f.id} className="px-4 sm:px-6 py-4 flex justify-between hover:bg-slate-800/30">
                <div className="flex gap-3">
                  <span className="text-xl">{icon(f)}</span>
                  <div>
                    {isFolder(f) ? (
                      <button onClick={() => {
                        window.history.pushState({},'',`/?folder=${f.id}`)
                        fetchFiles(f.id); fetchPath(f.id)
                      }} className="text-slate-200 hover:text-white">{f.name}</button>
                    ) : (
                      <a href={dlUrl(f)} target="_blank" className="text-slate-200 hover:text-white">{f.name}</a>
                    )}
                    <div className="text-xs text-slate-500 mt-1 space-x-2">
                      {!isFolder(f)&&f.size && <span>{fmtSize(f.size)}</span>}
                      <span>{fmtDate(f.modifiedTime)}</span>
                    </div>
                  </div>
                </div>

                {!isFolder(f) &&
                  <div className="flex gap-2">
                    <a href={dlUrl(f)} download className="text-xs bg-slate-800 px-3 py-1 rounded hover:bg-slate-700">Download</a>
                    <button onClick={() => { setPreviewFile(f); document.body.style.overflow='hidden' }}
                      className="text-xs bg-slate-700/50 px-3 py-1 rounded hover:bg-slate-700">Preview</button>
                  </div>}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ───────── Preview Modal ───────── */}
      {previewFile &&
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="bg-slate-900 rounded-xl border border-slate-700 w-full max-w-5xl max-h-[95vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-slate-700">
              <h2 className="font-medium">{previewFile.name}</h2>
              <button onClick={() => { setPreviewFile(null); document.body.style.overflow='unset' }}
                className="text-slate-400 hover:text-slate-200 text-xl">&times;</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {isVideoFile(previewFile) ? (
                <iframe
                  src={previewUrl(previewFile)}
                  allow="autoplay; fullscreen"
                  allowFullScreen
                  className="w-full h-[60vh] rounded-lg"
                />
              ) : isImageFile(previewFile) ? (
                <img
                  src={`https://drive.google.com/uc?export=view&id=${previewFile.id}`}
                  className="max-w-full max-h-[70vh] mx-auto"
                />
              ) : (
                <iframe
                  src={previewUrl(previewFile)}
                  className="w-full h-[60vh] rounded-lg bg-white"
                />
              )}

              <div className="mt-6 flex flex-wrap justify-center gap-3 border-t border-slate-700 pt-4">
                <a href={dlUrl(previewFile)} download className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Download</a>
                <button onClick={() => navigator.clipboard.writeText(directLink(previewFile))}
                  className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-slate-200">Copy Link</button>
                <a href={directLink(previewFile)} target="_blank"
                  className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-slate-200">Open in Drive</a>
              </div>
            </div>
          </div>
        </div>}

      {/* ───────── Global Styles ───────── */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
        .font-inter{font-family:'Inter',system-ui,sans-serif;}
        html{scroll-behavior:smooth;}
      `}</style>
    </div>
  )
}
