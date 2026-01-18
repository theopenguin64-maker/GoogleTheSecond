'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/results?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.watermark}>
        <img src="/media/magnifying_glass.webp" alt="" aria-hidden="true" />
      </div>
      <div className={styles.content}>
        <h1 className={styles.title}>Google the Second</h1>

        <form onSubmit={handleSearch} className={styles.searchForm}>
          <div className={styles.searchBar}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search PDFs..."
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchButton}>
              Search
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

