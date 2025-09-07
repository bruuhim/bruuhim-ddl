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
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

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

  const getFileIcon = (file: DriveFile): { icon: string; color: string; glow: string } => {
    if (isFolder(file)) return { icon: '📁', color: 'from-blue-400 to-purple-600', glow: 'shadow-blue-500/50' }
    
    const extension = file.name.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'mp4':
      case 'mkv':
      case 'avi':
      case 'mov':
        return { icon: '🎬', color: 'from-red-400 to-pink-600', glow: 'shadow-red-500/50' }
      case 'mp3':
      case 'wav':
      case 'flac':
        return { icon: '🎵', color: 'from-green-400 to-emerald-600', glow: 'shadow-green-500/50' }
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return { icon: '🖼️', color: 'from-orange-400 to-yellow-600', glow: 'shadow-orange-500/50' }
      case 'zip':
      case 'rar':
      case '7z':
        return { icon: '📦', color: 'from-purple-400 to-indigo-600', glow: 'shadow-purple-500/50' }
      case 'pdf':
        return { icon: '📄', color: 'from-gray-400 to-slate-600', glow: 'shadow-gray-500/50' }
      case 'txt':
        return { icon: '📝', color: 'from-cyan-400 to-teal-600', glow: 'shadow-cyan-500/50' }
      default:
        return { icon: '📄', color: 'from-gray-400 to-slate-600', glow: 'shadow-gray-500/50' }
    }
  }

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-20 animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
            NEXUS DRIVE
          </h1>
          <p className="text-xl text-gray-300 font-light">Advanced File System Interface</p>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 mx-auto mt-4 rounded-full animate-pulse"></div>
        </div>

        {/* Search and controls */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search through the nexus..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-4 bg-black/30 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 hover:bg-black/40"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="w-6 h-6 border-2 border-purple-400 rounded-full animate-spin border-t-transparent"></div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/50 font-medium"
            >
              {viewMode === 'grid' ? 'List View' : 'Grid View'}
            </button>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        {folderPath.length > 0 && (
          <nav className="mb-8">
            <div className="flex items-center space-x-2 p-4 bg-black/20 backdrop-blur-md rounded-2xl border border-white/10">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <Link 
                href="/"
                className="px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-300 text-cyan-400 font-medium"
                onClick={(e) => {
                  e.preventDefault()
                  handleFolderClick(process.env.NEXT_PUBLIC_GOOGLE_FOLDER_ID || '')
                }}
              >
                ROOT
              </Link>
              {folderPath.map((folder, idx) => (
                <div key={folder.id} className="flex items-center">
                  <div className="w-1 h-1 bg-white/40 rounded-full mx-3"></div>
                  <Link
                    href={`/?folder=${folder.id}`}
                    className="px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-300 text-purple-400 font-medium hover:text-white"
                    onClick={(e) => {
                      e.preventDefault()
                      handleFolderClick(folder.id)
                    }}
                  >
                    {folder.name}
                  </Link>
                </div>
              ))}
            </div>
          </nav>
        )}

        {loading ? (
          <div className="flex flex-col justify-center items-center h-96">
            <div className="relative">
              <div className="w-32 h-32 border-8 border-purple-400 rounded-full animate-spin border-t-transparent shadow-2xl shadow-purple-500/50"></div>
              <div className="absolute inset-4 border-4 border-pink-400 rounded-full animate-spin border-t-transparent animation-delay-500"></div>
              <div className="absolute inset-8 border-2 border-cyan-400 rounded-full animate-spin border-t-transparent animation-delay-1000"></div>
            </div>
            <p className="mt-8 text-xl text-gray-300 animate-pulse">Accessing the nexus...</p>
          </div>
        ) : (
          <>
            {filteredFiles.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center shadow-2xl">
                  <span className="text-6xl">🕳️</span>
                </div>
                <p className="text-2xl text-gray-300 mb-4">The nexus is empty</p>
                <p className="text-gray-500">No files detected in this dimensional space</p>
              </div>
            ) : (
              <div className={`${viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                : 'space-y-4'}`}>
                {filteredFiles.map((file, index) => {
                  const fileData = getFileIcon(file)
                  return (
                    <div 
                      key={file.id} 
                      className={`group relative ${
                        viewMode === 'grid' 
                          ? 'bg-black/20 backdrop-blur-md border border-white/10 rounded-3xl p-6 hover:border-purple-400/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25' 
                          : 'bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:border-purple-400/50 transition-all duration-300 flex items-center'
                      }`}
                      style={{
                        animationDelay: `${index * 50}ms`
                      }}
                    >
                      {/* Glowing border effect */}
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                      
                      <div className={`relative z-10 ${viewMode === 'grid' ? 'text-center' : 'flex items-center w-full'}`}>
                        {/* File icon */}
                        <div className={`${viewMode === 'grid' ? 'mb-4' : 'mr-4'}`}>
                          <div className={`${viewMode === 'grid' ? 'w-20 h-20' : 'w-16 h-16'} mx-auto bg-gradient-to-br ${fileData.color} rounded-2xl flex items-center justify-center shadow-2xl ${fileData.glow} group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300`}>
                            <span className="text-3xl filter drop-shadow-lg">{fileData.icon}</span>
                          </div>
                        </div>

                        {/* File info */}
                        <div className={`${viewMode === 'grid' ? '' : 'flex-1 min-w-0'}`}>
                          {isFolder(file) ? (
                            <button
                              onClick={() => handleFolderClick(file.id)}
                              className={`${viewMode === 'grid' ? 'block w-full' : 'text-left'} font-bold text-lg text-white hover:text-cyan-400 transition-colors duration-300 truncate mb-2 group-hover:scale-105`}
                            >
                              {file.name}
                            </button>
                          ) : (
                            <a
                              href={`https://drive.google.com/uc?export=download&id=${file.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`${viewMode === 'grid' ? 'block' : 'text-left'} font-bold text-lg text-white hover:text-cyan-400 transition-colors duration-300 truncate mb-2 group-hover:scale-105`}
                            >
                              {file.name}
                            </a>
                          )}
                          
                          <div className={`${viewMode === 'grid' ? 'space-y-1' : 'flex items-center space-x-4'} text-sm text-gray-400`}>
                            {file.size && !isFolder(file) && (
                              <span className="px-3 py-1 bg-white/10 rounded-full">
                                {formatFileSize(file.size)}
                              </span>
                            )}
                            <span className="px-3 py-1 bg-white/10 rounded-full">
                              {formatDate(file.modifiedTime)}
                            </span>
                          </div>
                        </div>

                        {/* Action buttons for files */}
                        {!isFolder(file) && (
                          <div className={`${viewMode === 'grid' ? 'mt-4 space-y-2' : 'ml-4 flex space-x-2'}`}>
                            <a
                              href={`https://drive.google.com/uc?export=download&id=${file.id}`}
                              download
                              className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 text-center font-medium shadow-lg shadow-green-500/25 hover:shadow-green-500/50 transform hover:scale-105"
                            >
                              Download
                            </a>
                            <a
                              href={`https://drive.google.com/file/d/${file.id}/view`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 text-center font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/50 transform hover:scale-105"
                            >
                              Preview
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div className="mt-16 text-center text-gray-500">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8"></div>
          <p className="text-sm">Powered by Nexus Drive Technology • Interfacing with dimensional storage</p>
        </div>
      </div>

      <style jsx>{`
        .animation-delay-500 {
          animation-delay: 0.5s;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  )
}
