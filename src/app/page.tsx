// src/app/page.tsx
async function getFiles() {
  // This fetch request will be server-side
  const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/files`, { cache: 'no-store' });
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
        {files?.map((file: any) => (
          <li key={file.id} className="text-lg">
            <a
              href={`https://drive.google.com/uc?export=download&id=${file.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {/* Basic icon logic */}
              {file.mimeType === 'application/vnd.google-apps.folder' ? '📁' : '📄'} {file.name}
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}