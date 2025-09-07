// src/app/page.tsx

// Define a specific type for our file objects
type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
};

async function getFiles() {
  // Make sure NEXT_PUBLIC_URL is set in Vercel
  const baseUrl = process.env.NEXT_PUBLIC_URL; 
  const res = await fetch(`${baseUrl}/api/files`, { cache: 'no-store' });
  
  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }
  return res.json();
}

export default async function HomePage() {
  const { files } = await getFiles();

  return (
    <main className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Files</h1>
      <ul className="list-disc pl-5 space-y-2">
        {files?.map((file: DriveFile) => ( // Use the specific DriveFile type instead of 'any'
          <li key={file.id} className="text-lg">
            <a
              href={
                file.mimeType === 'application/vnd.google-apps.folder'
                  ? `https://drive.google.com/drive/folders/${file.id}`
                  : `https://drive.google.com/uc?export=download&id=${file.id}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {file.mimeType === 'application/vnd.google-apps.folder' ? '📁' : '📄'} {file.name}
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
