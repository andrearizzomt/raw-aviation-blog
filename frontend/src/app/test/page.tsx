import { getArticles, getGalleries, getReports } from '@/lib/api/content';

export default async function TestPage() {
  try {
    console.log('Starting API tests...'); // Debug log

    // Test fetching articles
    console.log('Fetching articles...'); // Debug log
    const { articles, pagination: articlesPagination } = await getArticles(1, 2);
    
    // Test fetching galleries
    console.log('Fetching galleries...'); // Debug log
    const { galleries, pagination: galleriesPagination } = await getGalleries(1, 2);
    
    // Test fetching reports
    console.log('Fetching reports...'); // Debug log
    const { reports, pagination: reportsPagination } = await getReports(1, 2);

    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-8">API Test Results</h1>
        
        <div className="mb-8 p-4 bg-green-50 text-green-700 rounded">
          ✅ Connection to Strapi successful! The API is responding correctly.
        </div>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Articles</h2>
          {articles.length === 0 ? (
            <div className="bg-yellow-50 p-4 rounded text-yellow-700">
              No articles found. You need to create some articles in Strapi first.
            </div>
          ) : (
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-black">
              {JSON.stringify({ articles, pagination: articlesPagination }, null, 2)}
            </pre>
          )}
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Galleries</h2>
          {galleries.length === 0 ? (
            <div className="bg-yellow-50 p-4 rounded text-yellow-700">
              No galleries found. You need to create some galleries in Strapi first.
            </div>
          ) : (
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-black">
              {JSON.stringify({ galleries, pagination: galleriesPagination }, null, 2)}
            </pre>
          )}
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Reports</h2>
          {reports.length === 0 ? (
            <div className="bg-yellow-50 p-4 rounded text-yellow-700">
              No reports found. You need to create some reports in Strapi first.
            </div>
          ) : (
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-black">
              {JSON.stringify({ reports, pagination: reportsPagination }, null, 2)}
            </pre>
          )}
        </section>

        <div className="mt-8 p-4 bg-blue-50 text-blue-700 rounded">
          Next steps:
          <ol className="list-decimal ml-6 mt-2">
            <li>Go to Strapi admin panel (http://localhost:1337/admin)</li>
            <li>Create some test content (articles, galleries, reports)</li>
            <li>Refresh this page to see the content</li>
          </ol>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Test page error:', error); // Debug log

    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Error Testing API</h1>
        <pre className="bg-red-50 p-4 rounded text-red-800 whitespace-pre-wrap">
          {error instanceof Error ? 
            `${error.message}\n\n${error.stack}` : 
            'Unknown error occurred'
          }
        </pre>
        <div className="mt-4 p-4 bg-yellow-50 text-yellow-700 rounded">
          Debug Information:
          <ul className="list-disc ml-6 mt-2">
            <li>Strapi URL: {process.env.NEXT_PUBLIC_STRAPI_API_URL}</li>
            <li>Next.js Environment: {process.env.NODE_ENV}</li>
          </ul>
          <div className="mt-4">
            Make sure:
            <ul className="list-disc ml-6 mt-2">
              <li>Strapi is running (cd cms && npm run develop)</li>
              <li>Your .env.local has correct NEXT_PUBLIC_STRAPI_API_URL</li>
              <li>You can access Strapi admin at http://localhost:1337/admin</li>
              <li>Check browser console for detailed error logs</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
} 