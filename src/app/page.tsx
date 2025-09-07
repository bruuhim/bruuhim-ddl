'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface DriveFile {
  id: string
  name: string
  mimeType: string
  size?: string
  modifiedTime: string
  parents?: string[]
}

interface FolderPathItem {
  id: string
  name: string
}

export default function Home() {
  const [files, setFiles] = useState<DriveFile[]>([])
  const [loading, setLoading] = useState(true)
  const [folderPath, setFolderPath] = useState<FolderPathItem[]>([])
  const [currentFolderId, setCurrentFolderId] = useState<string>('')
  const [previewFile, setPreviewFile] = useState<DriveFile | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const folderId = params.get('folder') || process.env.NEXT_PUBLIC_GOOGLE_FOLDER_ID || ''
    
    setCurrentFolderId(folderId)
    fetchFiles(folderId)
    fetchFolderPath(folderId)

    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search)
      const folderId = params.get('folder') || process.env.NEXT_PUBLIC_GOOGLE_FOLDER_ID || ''
      setCurrentFolderId(folderId)
      fetchFiles(folderId)
      fetchFolderPath(folderId)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const fetchFiles = async (folderId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/files?folderId=${folderId}`)
      const data = await response.json()
      setFiles(data.files || [])
    } catch (err) {
      console.error('Error fetching files:', err)
      setFiles([])
    }
    setLoading(false)
  }

  const fetchFolderPath = async (folderId: string) => {
    try {
      const response = await fetch(`/api/folder-path?folderId=${folderId}`)
      const data = await response.json()
      setFolderPath(data.path || [])
    } catch (err) {
      console.error('Error fetching folder path:', err)
      setFolderPath([])
    }
  }

  const isFolder = (file: DriveFile): boolean => {
    return file.mimeType === 'application/vnd.google-apps.folder'
  }

  const formatFileSize = (bytes: string): string => {
    if (!bytes) return ''
    const size = parseInt(bytes)
    const units = ['B', 'KB', 'MB', 'GB']
    let unitIndex = 0
    let fileSize = size

    while (fileSize >= 1024 && unitIndex < units.length - 1) {
      fileSize /= 1024
      unitIndex++
    }
    return `${fileSize.toFixed(1)} ${units[unitIndex]}`
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleFolderClick = (folderId: string) => {
    const newUrl = `/?folder=${folderId}`
    window.history.pushState({}, '', newUrl)
    setCurrentFolderId(folderId)
    fetchFiles(folderId)
    fetchFolderPath(folderId)
  }

  const handlePreview = (file: DriveFile) => {
    setPreviewFile(file)
    document.body.style.overflow = 'hidden'
  }

  const closePreview = () => {
    setPreviewFile(null)
    document.body.style.overflow = 'unset'
  }

  const getFileIcon = (file: DriveFile): string => {
    if (isFolder(file)) return '📁'
    
    const extension = file.name.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'mp4': case 'mkv': case 'avi': case 'mov': return '🎬'
      case 'mp3': case 'wav': case 'flac': return '🎵'
      case 'jpg': case 'jpeg': case 'png': case 'gif': return '🖼️'
      case 'zip': case 'rar': case '7z': return '📦'
      case 'pdf': return '📄'
      case 'txt': return '📝'
      default: return '📄'
    }
  }

  const getPreviewUrl = (file: DriveFile): string => {
    const extension = file.name.split('.').pop()?.toLowerCase()
    
    // For videos and images, use streaming URL
    if (['mp4', 'mkv', 'avi', 'mov', 'jpg', 'jpeg', 'png', 'gif', 'mp3', 'wav'].includes(extension || '')) {
      return `https://drive.google.com/uc?export=view&id=${file.id}`
    }
    
    // For other files, use embed URL
    return `https://drive.google.com/file/d/${file.id}/preview`
  }

  const isVideoFile = (file: DriveFile): boolean => {
    const extension = file.name.split('.').pop()?.toLowerCase()
    return ['mp4', 'mkv', 'avi', 'mov', 'webm'].includes(extension || '')
  }

  const isImageFile = (file: DriveFile): boolean => {
    const extension = file.name.split('.').pop()?.toLowerCase()
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')
  }

  const isAudioFile = (file: DriveFile): boolean => {
    const extension = file.name.split('.').pop()?.toLowerCase()
    return ['mp3', 'wav', 'flac', 'm4a'].includes(extension || '')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-inter">
      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="w-14 h-14 rounded-2xl overflow-hidden ring-1 ring-slate-700/30 group-hover:ring-slate-600/50 transition-all duration-300">
                  <img 
                    src="/logo.png" 
                    alt="Bruuhim" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-light tracking-tight text-slate-100">
                  Bruuhim <span className="font-normal text-slate-400">DDL</span>
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-slate-500 font-medium">Created by</p>
                <a 
                  href="https://x.com/bruuhim" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-300 hover:text-slate-100 transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  @bruuhim
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-12">
        {/* Breadcrumb */}
        {folderPath.length > 0 && (
          <nav className="mb-10" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-3 text-sm">
              <li>
                <Link 
                  href="/"
                  className="text-slate-400 hover:text-slate-200 transition-colors duration-200 font-medium flex items-center gap-2"
                  onClick={(e) => {
                    e.preventDefault()
                    handleFolderClick(process.env.NEXT_PUBLIC_GOOGLE_FOLDER_ID || '')
                  }}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                  </svg>
                  Home
                </Link>
              </li>
              {folderPath.map((folder, idx) => (
                <li key={folder.id} className="flex items-center">
                  <svg className="w-4 h-4 text-slate-600 mx-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                  </svg>
                  <Link
                    href={`/?folder=${folder.id}`}
                    className="text-slate-400 hover:text-slate-200 transition-colors duration-200 font-medium"
                    onClick={(e) => {
                      e.preventDefault()
                      handleFolderClick(folder.id)
                    }}
                  >
                    {folder.name}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <div className="w-10 h-10 border-2 border-slate-700 border-t-slate-400 rounded-full animate-spin"></div>
            </div>
            <p className="mt-6 text-slate-400 text-sm font-medium">Loading files...</p>
          </div>
        ) : (
          /* File Grid */
          <div className="bg-slate-900/30 rounded-3xl border border-slate-800/50 overflow-hidden backdrop-blur-sm">
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-800/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
                  </svg>
                  <h2 className="text-xl font-medium text-slate-200">Files & Folders</h2>
                </div>
                <span className="text-sm text-slate-500 bg-slate-800/50 px-3 py-1 rounded-full">
                  {files.length} {files.length === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>
            
            {/* File List */}
            {files.length === 0 ? (
              <div className="text-center py-24">
                <svg className="w-16 h-16 text-slate-600 mx-auto mb-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
                </svg>
                <h3 className="text-lg font-medium text-slate-300 mb-2">No files found</h3>
                <p className="text-slate-500">This folder appears to be empty</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/50">
                {files.map((file, index) => (
                  <div 
                    key={file.id} 
                    className="px-8 py-5 hover:bg-slate-800/30 transition-all duration-200 group"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-5 flex-1 min-w-0">
                        <div className="text-2xl opacity-80 group-hover:opacity-100 transition-opacity duration-200">
                          {getFileIcon(file)}
                        </div>
                        <div className="flex-1 min-w-0">
                          {isFolder(file) ? (
                            <button
                              onClick={() => handleFolderClick(file.id)}
                              className="text-slate-200 hover:text-white font-medium truncate block text-left transition-colors duration-200 group-hover:translate-x-1 transform"
                            >
                              {file.name}
                            </button>
                          ) : (
                            <a
                              href={`https://drive.google.com/uc?export=download&id=${file.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-200 hover:text-white font-medium truncate block transition-colors duration-200 group-hover:translate-x-1 transform"
                            >
                              {file.name}
                            </a>
                          )}
                          <div className="flex items-center gap-4 mt-2">
                            {file.size && !isFolder(file) && (
                              <span className="text-xs text-slate-500 bg-slate-800/50 px-2 py-1 rounded-md">
                                {formatFileSize(file.size)}
                              </span>
                            )}
                            <span className="text-xs text-slate-500">
                              {formatDate(file.modifiedTime)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {!isFolder(file) && (
                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-4 group-hover:translate-x-0">
                          <a
                            href={`https://drive.google.com/uc?export=download&id=${file.id}`}
                            download
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-4 py-2 rounded-xl transition-all duration-200 text-sm font-medium border border-slate-700/50 hover:border-slate-600"
                          >
                            Download
                          </a>
                          <button
                            onClick={() => handlePreview(file)}
                            className="bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white px-4 py-2 rounded-xl transition-all duration-200 text-sm font-medium border border-slate-700/30 hover:border-slate-600"
                          >
                            Preview
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Custom Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-700 max-w-6xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div className="flex items-center gap-4">
                <div className="text-2xl">
                  {getFileIcon(previewFile)}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-200 truncate">
                    {previewFile.name}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {previewFile.size && formatFileSize(previewFile.size)} • {formatDate(previewFile.modifiedTime)}
                  </p>
                </div>
              </div>
              <button
                onClick={closePreview}
                className="text-slate-400 hover:text-slate-200 transition-colors p-2"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {isVideoFile(previewFile) ? (
                <div className="bg-black rounded-xl overflow-hidden">
                  <video
                    controls
                    className="w-full h-auto max-h-[60vh]"
                    preload="metadata"
                  >
                    <source src={getPreviewUrl(previewFile)} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : isImageFile(previewFile) ? (
                <div className="flex justify-center">
                  <img
                    src={getPreviewUrl(previewFile)}
                    alt={previewFile.name}
                    className="max-w-full max-h-[60vh] rounded-xl"
                  />
                </div>
              ) : isAudioFile(previewFile) ? (
                <div className="bg-slate-800 rounded-xl p-8 text-center">
                  <div className="text-6xl mb-6">🎵</div>
                  <audio
                    controls
                    className="w-full max-w-md mx-auto"
                    preload="metadata"
                  >
                    <source src={getPreviewUrl(previewFile)} />
                    Your browser does not support the audio tag.
                  </audio>
                </div>
              ) : (
                <div className="bg-white rounded-xl overflow-hidden">
                  <iframe
                    src={getPreviewUrl(previewFile)}
                    className="w-full h-[60vh]"
                    title={previewFile.name}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-slate-700">
                <a
                  href={`https://drive.google.com/uc?export=download&id=${previewFile.id}`}
                  download
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all duration-200 font-medium flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                  Download
                </a>
                <a
                  href={`https://drive.google.com/file/d/${previewFile.id}/view`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-6 py-3 rounded-xl transition-all duration-200 font-medium flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
                  </svg>
                  Open in Drive
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center pb-12 pt-20">
        <p className="text-slate-600 text-sm font-medium">
          <a 
            href="https://x.com/bruuhim" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-slate-400 transition-colors duration-200"
          >
            @bruuhim
          </a>
        </p>
      </footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
        
        .font-inter {
          font-family: 'Inter', system-ui, sans-serif;
          font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
        }
        
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  )
}
