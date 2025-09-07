'use client'

import { useState, useEffect } from 'react'

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

// SVG Icon Components for a cleaner look
const FileIcon = ({ file }: { file: DriveFile }) => {
  const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
  if (isFolder) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500">
        <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path>
      </svg>
    )
  }

  const extension = file.name.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'mp4': case 'mkv': case 'avi': case 'mov':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line>
        </svg>
      )
    case 'mp3': case 'wav': case 'flac':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400">
          <path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle>
        </svg>
      )
    case 'jpg': case 'jpeg': case 'png': case 'gif':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
        </svg>
      )
    case 'zip': case 'rar': case '7z':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
      )
    case 'pdf':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      )
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline>
        </svg>
      )
  }
}

export default function Home() {
  const [files, setFiles] = useState<DriveFile[]>([])
  const [loading, setLoading] = useState(true)
  const [folderPath, setFolderPath] = useState<FolderPathItem[]>([])
  const [currentFolderId, setCurrentFolderId] = useState<string>('')

  // FIX: process.env is not available in the browser. 
  // Replace these with your actual values or a proper configuration method.
  const NEXT_PUBLIC_GOOGLE_FOLDER_ID = '17LikukvKy1ZwEGOumX6uBDD4NOHPVgmi';
  const NEXT_PUBLIC_URL = 'bruuhim-ddl.vercel.app'; // Assuming API is on the same domain, or provide full URL.

  useEffect(() => {
    // Set dark mode on the body
    document.body.classList.add('bg-gray-900', 'text-gray-200');
    
    const params = new URLSearchParams(window.location.search)
    const folderId = params.get('folder') || NEXT_PUBLIC_GOOGLE_FOLDER_ID || ''
    
    setCurrentFolderId(folderId)
    fetchFiles(folderId)
    fetchFolderPath(folderId)
  }, [])

  const fetchFiles = async (folderId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`${NEXT_PUBLIC_URL}/api/files?folderId=${folderId}`)
      const data = await response.json()
      // Sort files to show folders first
      const sortedFiles = (data.files || []).sort((a: DriveFile, b: DriveFile) => {
        const aIsFolder = a.mimeType === 'application/vnd.google-apps.folder';
        const bIsFolder = b.mimeType === 'application/vnd.google-apps.folder';
        if (aIsFolder && !bIsFolder) return -1;
        if (!aIsFolder && bIsFolder) return 1;
        return a.name.localeCompare(b.name);
      });
      setFiles(sortedFiles)
    } catch (err) {
      console.error('Error fetching files:', err)
      setFiles([])
    }
    setLoading(false)
  }

  const fetchFolderPath = async (folderId: string) => {
    try {
      const response = await fetch(`${NEXT_PUBLIC_URL}/api/folder-path?folderId=${folderId}`)
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
    if (size === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(size) / Math.log(1024));
    return `${parseFloat((size / Math.pow(1024, i)).toFixed(2))} ${units[i]}`
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const handleFolderClick = (folderId: string) => {
    const newUrl = `/?folder=${folderId}`
    window.history.pushState({}, '', newUrl)
    setCurrentFolderId(folderId)
    fetchFiles(folderId)
    fetchFolderPath(folderId)
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl min-h-screen flex flex-col">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Bruuhim DDL
        </h1>
        <p className="text-gray-400 mt-2">Your Modern File Directory</p>
      </header>
      
      <main className="flex-grow">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 p-3 bg-gray-800/50 rounded-lg backdrop-blur-sm">
          <ol className="flex items-center space-x-2 text-sm text-gray-400 overflow-x-auto whitespace-nowrap">
            <li>
              <a  
                href="#"
                className="hover:text-blue-400 transition-colors"
                onClick={(e) => {
                  e.preventDefault()
                  handleFolderClick(NEXT_PUBLIC_GOOGLE_FOLDER_ID || '')
                }}
              >
                Home
              </a>
            </li>
            {folderPath.map((folder) => (
              <li key={folder.id} className="flex items-center">
                <span className="mx-2 text-gray-600">/</span>
                <a
                  href={`/?folder=${folder.id}`}
                  className="hover:text-blue-400 transition-colors"
                  onClick={(e) => {
                    e.preventDefault()
                    handleFolderClick(folder.id)
                  }}
                >
                  {folder.name}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="bg-gray-800/50 rounded-xl shadow-2xl shadow-black/20 overflow-hidden backdrop-blur-sm">
            {files.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                 <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-gray-600"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><path d="M12 18h.01"></path><path d="M12 15a3 3 0 1 0-3-3"></path></svg>
                <p className="text-lg">This folder is empty.</p>
                <p className="text-sm">No files or folders found here.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700/50">
                {files.map((file) => (
                  <div key={file.id} className="p-4 hover:bg-gray-700/50 transition-colors duration-200">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                           <FileIcon file={file} />
                        </div>
                        <div className="flex-1 min-w-0">
                          {isFolder(file) ? (
                            <button
                              onClick={() => handleFolderClick(file.id)}
                              className="text-blue-400 hover:text-blue-300 font-medium truncate block text-left transition-colors text-base"
                            >
                              {file.name}
                            </button>
                          ) : (
                            <a
                              href={`https://drive.google.com/uc?export=download&id=${file.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-200 hover:text-blue-400 font-medium truncate block transition-colors text-base"
                            >
                              {file.name}
                            </a>
                          )}
                          <div className="flex items-center flex-wrap gap-x-4 mt-1 text-xs text-gray-400">
                            {file.size && !isFolder(file) && (
                              <span>{formatFileSize(file.size)}</span>
                            )}
                            <span>Modified: {formatDate(file.modifiedTime)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {!isFolder(file) && (
                        <div className="flex items-center space-x-2 flex-shrink-0 self-end sm:self-center">
                          <a
                            href={`https://drive.google.com/file/d/${file.id}/view`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-gray-700 text-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-600 transition-all duration-200 text-sm font-medium"
                          >
                            Preview
                          </a>
                          <a
                            href={`https://drive.google.com/uc?export=download&id=${file.id}`}
                            download
                            className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 transition-all duration-200 text-sm font-medium"
                          >
                            Download
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
      </main>

      <footer className="text-center py-6 mt-8">
        <p className="text-gray-500 text-sm">
          Designed By <a href="https://x.com/bruuhim" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">@bruuhim</a>
        </p>
      </footer>
    </div>
  )
}

