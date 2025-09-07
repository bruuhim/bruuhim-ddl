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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const folderId = params.get('folder') || process.env.NEXT_PUBLIC_GOOGLE_FOLDER_ID || ''
    
    setCurrentFolderId(folderId)
    fetchFiles(folderId)
    fetchFolderPath(folderId)
  }, [])

  const fetchFiles = async (folderId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/files?folderId=${folderId}`)
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/folder-path?folderId=${folderId}`)
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
    return new Date(dateString).toLocaleDateString()
  }

  const handleFolderClick = (folderId: string) => {
    const newUrl = `/?folder=${folderId}`
    window.history.pushState({}, '', newUrl)
    setCurrentFolderId(folderId)
    fetchFiles(folderId)
    fetchFolderPath(folderId)
  }

  const getFileIcon = (file: DriveFile): string => {
    if (isFolder(file)) return '📁'
    
    const extension = file.name.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'mp4':
      case 'mkv':
      case 'avi':
      case 'mov':
        return '🎬'
      case 'mp3':
      case 'wav':
      case 'flac':
        return '🎵'
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️'
      case 'zip':
      case 'rar':
      case '7z':
        return '📦'
      case 'pdf':
        return '📄'
      case 'txt':
        return '📝'
      default:
        return '📄'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <div className="backdrop-blur-xl bg-black/30 border-b border-gray-700/50 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Bruuhim DDL
              </h1>
              <p className="text-sm text-gray-400 mt-1">Premium File Directory</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Designed by</p>
              <a 
                href="https://x.com/bruuhim" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
              >
                @bruuhim
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 max-w-6xl">
        {/* Breadcrumb Navigation */}
        {folderPath.length > 0 && (
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link 
                  href="/"
                  className="text-gray-400 hover:text-blue-400 transition-all duration-300 hover:scale-105 font-medium"
                  onClick={(e) => {
                    e.preventDefault()
                    handleFolderClick(process.env.NEXT_PUBLIC_GOOGLE_FOLDER_ID || '')
                  }}
                >
                  🏠 Home
                </Link>
              </li>
              {folderPath.map((folder, idx) => (
                <li key={folder.id} className="flex items-center">
                  <span className="mx-3 text-gray-600">▶</span>
                  <Link
                    href={`/?folder=${folder.id}`}
                    className="text-gray-300 hover:text-blue-400 transition-all duration-300 hover:scale-105 font-medium"
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

        {loading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-2 border-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-full"></div>
              <div className="absolute inset-2 bg-gray-900 rounded-full"></div>
            </div>
            <p className="mt-4 text-gray-400 animate-pulse">Loading files...</p>
          </div>
        ) : (
          <div className="backdrop-blur-xl bg-gray-800/30 rounded-2xl border border-gray-700/50 overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 px-6 py-4 border-b border-gray-700/50">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  📂 Files & Folders
                </h2>
                <div className="text-sm text-gray-400">
                  {files.length} items
                </div>
              </div>
            </div>
            
            {files.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4 opacity-50">📂</div>
                <p className="text-gray-400 text-lg">This folder is empty</p>
                <p className="text-gray-500 text-sm mt-2">No files or folders found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700/50">
                {files.map((file, index) => (
                  <div 
                    key={file.id} 
                    className="px-6 py-4 hover:bg-gray-700/30 transition-all duration-300 group animate-fadeIn"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        <div className="text-2xl group-hover:scale-110 transition-transform duration-300">
                          {getFileIcon(file)}
                        </div>
                        <div className="flex-1 min-w-0">
                          {isFolder(file) ? (
                            <button
                              onClick={() => handleFolderClick(file.id)}
                              className="text-blue-400 hover:text-blue-300 font-semibold truncate block text-left transition-all duration-300 hover:translate-x-1"
                            >
                              {file.name}
                            </button>
                          ) : (
                            <a
                              href={`https://drive.google.com/uc?export=download&id=${file.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white hover:text-blue-400 font-semibold truncate block transition-all duration-300 hover:translate-x-1"
                            >
                              {file.name}
                            </a>
                          )}
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-400">
                            {file.size && !isFolder(file) && (
                              <span className="bg-gray-700/50 px-2 py-1 rounded-full text-xs">
                                {formatFileSize(file.size)}
                              </span>
                            )}
                            <span>📅 {formatDate(file.modifiedTime)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {!isFolder(file) && (
                        <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <a
                            href={`https://drive.google.com/uc?export=download&id=${file.id}`}
                            download
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-blue-500/25 hover:scale-105"
                          >
                            ⬇️ Download
                          </a>
                          <a
                            href={`https://drive.google.com/file/d/${file.id}/view`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-gray-500/25 hover:scale-105"
                          >
                            👁️ Preview
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 pb-8">
          <div className="inline-flex items-center space-x-2 text-gray-400 text-sm">
            <span>⚡ Powered by</span>
            <a 
              href="https://x.com/bruuhim" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              @bruuhim
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
