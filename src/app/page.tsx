import React, { useState, useEffect } from 'react';
import { Search, Folder, File, Download, Eye, Home, ChevronRight, Grid, List } from 'lucide-react';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  modifiedTime: string;
  webViewLink: string;
  webContentLink?: string;
}

interface FolderPath {
  id: string;
  name: string;
}

export default function FileIndexer() {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFolderId, setCurrentFolderId] = useState('17LikukvKy1ZwEGOumX6uBDD4NOHPVgmi');
  const [folderPath, setFolderPath] = useState<FolderPath[]>([{ id: '17LikukvKy1ZwEGOumX6uBDD4NOHPVgmi', name: 'Root' }]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const fetchFiles = async (folderId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/files?folderId=${folderId}`);
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFolderPath = async (folderId: string) => {
    try {
      const response = await fetch(`/api/folder-path?folderId=${folderId}`);
      if (response.ok) {
        const data = await response.json();
        setFolderPath(data.path || []);
      }
    } catch (error) {
      console.error('Error fetching folder path:', error);
    }
  };

  const navigateToFolder = (folderId: string, folderName: string) => {
    setCurrentFolderId(folderId);
    fetchFiles(folderId);
    fetchFolderPath(folderId);
  };

  const navigateToBreadcrumb = (folderId: string, index: number) => {
    const newPath = folderPath.slice(0, index + 1);
    setFolderPath(newPath);
    setCurrentFolderId(folderId);
    fetchFiles(folderId);
  };

  useEffect(() => {
    fetchFiles(currentFolderId);
  }, [currentFolderId]);

  const isFolder = (file: DriveFile) => file.mimeType === 'application/vnd.google-apps.folder';

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const getFileIcon = (file: DriveFile) => {
    if (isFolder(file)) {
      return <Folder className="w-5 h-5 text-blue-400" />;
    }
    return <File className="w-5 h-5 text-gray-400" />;
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const folders = filteredFiles.filter(isFolder);
  const regularFiles = filteredFiles.filter(file => !isFolder(file));

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">File Explorer</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 mb-6 text-sm text-gray-500">
          <Home className="w-4 h-4" />
          {folderPath.map((folder, index) => (
            <React.Fragment key={folder.id}>
              <button
                onClick={() => navigateToBreadcrumb(folder.id, index)}
                className="hover:text-gray-700 transition-colors"
              >
                {folder.name}
              </button>
              {index < folderPath.length - 1 && <ChevronRight className="w-4 h-4" />}
            </React.Fragment>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Folders */}
            {folders.length > 0 && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-3">Folders</h2>
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-1'}>
                  {folders.map((folder) => (
                    <div
                      key={folder.id}
                      onClick={() => navigateToFolder(folder.id, folder.name)}
                      className={`${
                        viewMode === 'grid' 
                          ? 'p-4 border border-gray-200 rounded-lg hover:shadow-md cursor-pointer transition-all' 
                          : 'flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors rounded-md'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {getFileIcon(folder)}
                        <span className="text-sm font-medium text-gray-900 truncate">{folder.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Files */}
            {regularFiles.length > 0 && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-3">Files</h2>
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-1'}>
                  {regularFiles.map((file) => (
                    <div
                      key={file.id}
                      className={`${
                        viewMode === 'grid' 
                          ? 'p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all' 
                          : 'flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors rounded-md'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        {getFileIcon(file)}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        {file.webContentLink && (
                          <a
                            href={file.webContentLink}
                            className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredFiles.length === 0 && !loading && (
              <div className="text-center py-12">
                <File className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-white">No files found</h3>
                <p className="mt-1 text-sm text-gray-400">
                  {searchTerm ? 'Try adjusting your search terms.' : 'This folder is empty.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-700 text-center">
          <p className="text-sm text-gray-400">
            Designed by{' '}
            <a
              href="https://x.com/bruuhim"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              @bruuhim
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
