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

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">File Explorer</h1>
          <p className="text-gray-400">Browse and download your files</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Breadcrumb */}
        {folderPath.length > 0 && (
          <nav className="mb-6">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Link 
                href="/"
                className="hover:text-white transition-colors duration-200"
                onClick={(e) => {
                  e.preventDefault()
                  handleFolderClick(process.env.NEXT_PUBLIC_GOOGLE_FOLDER_ID || '')
                }}
              >
                Home
              </Link>
              {folderPath.map((folder) => (
                <div key={folder.id} className="flex items-center">
                  <span className="mx-2">/</span>
                  <Link
                    href={`/?folder=${folder.id}`}
                    className="hover:text-white transition-colors duration-200"
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

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* File Grid */}
            {filteredFiles.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <div className="text-6xl mb-4">📂</div>
                <p className="text-xl">No files found</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredFiles.map((file) => (
                  <div 
                    key={file.id}
                    className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:bg-gray-750 hover:border-gray-600 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        {/* File Icon */}
                        <div className="text-2xl">{getFileIcon(file)}</div>
                        
                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          {isFolder(file) ? (
                            <button
                              onClick={() => handleFolderClick(file.id)}
                              className="text-blue-400 hover:text-blue-300 font-medium truncate block text-left transition-colors duration-200"
                            >
                              {file.name}
                            </button>
                          ) : (
                            <a
                              href={`https://drive.google.com/uc?export=download&id=${file.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white hover:text-gray-300 font-medium truncate block transition-colors duration-200"
                            >
                              {file.name}
                            </a>
                          )}
                          
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-400">
                            {file.size && !isFolder(file) && (
                              <span>{formatFileSize(file.size)}</span>
                            )}
                            <span>{formatDate(file.modifiedTime)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      {!isFolder(file) && (
                        <div className="flex items-center space-x-2">
                          <a
                            href={`https://drive.google.com/uc?export=download&id=${file.id}`}
                            download
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                          >
                            Download
                          </a>
                          <a
                            href={`https://drive.google.com/file/d/${file.id}/view`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                          >
                            Preview
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
