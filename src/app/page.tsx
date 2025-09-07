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
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 text-center">File Directory</h1>
      
      {/* Breadcrumb Navigation */}
      {folderPath.length > 0 && (
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <Link 
                href="/"
                className="hover:text-blue-600 transition-colors"
                onClick={(e) => {
                  e.preventDefault()
                  handleFolderClick(process.env.NEXT_PUBLIC_GOOGLE_FOLDER_ID || '')
                }}
              >
                Home
              </Link>
            </li>
            {folderPath.map((folder, idx) => (
              <li key={folder.id} className="flex items-center">
                <span className="mx-2">/</span>
                <Link
                  href={`/?folder=${folder.id}`}
                  className="hover:text-blue-600 transition-colors"
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
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-3 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Files</h2>
          </div>
          
          {files.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No files found in this folder</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {files.map((file) => (
                <div key={file.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <span className="text-2xl">{getFileIcon(file)}</span>
                      <div className="flex-1 min-w-0">
                        {isFolder(file) ? (
                          <button
                            onClick={() => handleFolderClick(file.id)}
                            className="text-blue-600 hover:text-blue-800 font-medium truncate block text-left transition-colors"
                          >
                            {file.name}
                          </button>
                        ) : (
                          <a
                            href={`https://drive.google.com/uc?export=download&id=${file.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-900 hover:text-blue-600 font-medium truncate block transition-colors"
                          >
                            {file.name}
                          </a>
                        )}
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                          {file.size && !isFolder(file) && (
                            <span>{formatFileSize(file.size)}</span>
                          )}
                          <span>Modified {formatDate(file.modifiedTime)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {!isFolder(file) && (
                      <div className="flex items-center space-x-2">
                        <a
                          href={`https://drive.google.com/uc?export=download&id=${file.id}`}
                          download
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Download
                        </a>
                        <a
                          href={`https://drive.google.com/file/d/${file.id}/view`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors text-sm font-medium"
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
        </div>
      )}
    </div>
  )
}
