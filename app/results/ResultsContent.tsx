'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import PDFPreview from './PDFPreview';
import styles from './page.module.css';

interface SearchResult {
  id: string;
  filename: string;
  s3_key: string;
  snippets: string[];
}

export default function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newQuery, setNewQuery] = useState(query);

  useEffect(() => {
    if (query) {
      performSearch(query);
    } else {
      setLoading(false);
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Search failed');
      }

      setResults(data.results || []);
    } catch (err: any) {
      setError(err.message || 'Failed to perform search');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuery.trim()) {
      router.push(`/results?q=${encodeURIComponent(newQuery.trim())}`);
    }
  };

  const openPDF = async (s3Key: string) => {
    try {
      const response = await fetch(`/api/pdf-url?key=${encodeURIComponent(s3Key)}`);
      const data = await response.json();
      
      if (response.ok && data.url) {
        window.open(data.url, '_blank');
      } else {
        console.error('Failed to get PDF URL');
      }
    } catch (err) {
      console.error('Error opening PDF:', err);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.loading}>Searching...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title} onClick={() => router.push('/')}>
            Google the Second
          </h1>

          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.searchBar}>
              <input
                type="text"
                value={newQuery}
                onChange={(e) => setNewQuery(e.target.value)}
                placeholder="Search PDFs..."
                className={styles.searchInput}
              />
              <button type="submit" className={styles.searchButton}>
                Search
              </button>
            </div>
          </form>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {!loading && !error && (
          <div className={styles.results}>
            {results.length === 0 ? (
              <div className={styles.noResults}>
                No results found for "{query}"
              </div>
            ) : (
              <>
                <div className={styles.resultsCount}>
                  Found {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
                </div>
                {results.map((result) => (
                  <div key={result.id} className={styles.resultItem}>
                    <div className={styles.resultContent}>
                      <PDFPreview
                        s3Key={result.s3_key}
                        filename={result.filename}
                        onClick={() => openPDF(result.s3_key)}
                      />
                      <div className={styles.resultText}>
                        <h3
                          className={styles.resultTitle}
                          onClick={() => openPDF(result.s3_key)}
                        >
                          {result.filename}
                        </h3>
                        {result.snippets.map((snippet, index) => (
                          <div
                            key={index}
                            className={styles.snippet}
                            dangerouslySetInnerHTML={{ __html: snippet }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

