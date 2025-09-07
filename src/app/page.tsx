// src/app/page.tsx
import { notFound } from 'next/navigation';

// Define a specific type for our file objects
type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  parents?: string[];
};

async function getFiles(folderId?: string) {
  const baseUrl = process.env.NEXT_PUBLIC_URL;
  const url = folderId 
    ? `${baseUrl}/api/files?folderId=${folderId}`
    : `${baseUrl}/api/files`;
  
  const res = await fetch(url, { cache: 'no-store' });
  
  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }
  return res.json();
}

async function getFolderPath(folderId?: string): Promise<{ id: string; name: string }[]> {
  if (!folderId) return [];
  
  const baseUrl = process.env.NEXT_PUBLIC_URL;
  const res = await fetch(`${baseUrl}/api/folder-path?folderId=${folderId}`, { cache: 'no-store' });
  
  if (!res.ok) return [];
  return res.json();
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: { folder?: string }
}) {
  const currentFolderId = searchParams.folder;
  
  try {
    const { files } = await getFiles(currentFolderId);
    const folderPath = await getFolderPath(currentFolderId);

    return (
      <main className="container mx-auto p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-4">Files</h1>
          
          {/* Breadcrumb navigation */}
          <nav className="text-sm text-gray-600 mb-4">
            <a href="/" className="hover:text-blue-600">Home</a>
            {folderPath.map((folder, index) => (
              <span key={folder.id}>
                <span className="mx-2">/</span>
                <a 
                  href={`/?folder=${folder.id}`} 
                  className="hover:text-blue-600"
                >
                  {folder.name}
                </a>
              </span>
            ))}
          </nav>
        </div>

        <ul className="list-disc pl-5 space-y-2">
          {files?.map((file: DriveFile) => (
            <li key={file.id} className="text-lg">
              {file.mimeType === 'application/vnd.google-apps.folder' ? (
                <a
                  href={`/?folder=${file.id}`}
                  className="text-blue-600 hover:underline"
                >
                  📁 {file.name}
                </a>
              ) : (
                <a
                  href={`https://drive.google.com/uc?export=download&id=${file.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  📄 {file.name}
                </a>
              )}
            </li>
          ))}
        </ul>
      </main>
    );
  } catch (error) {
    notFound();
  }
}
