import { Suspense } from 'react';
import ResultsContent from './ResultsContent';

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading...</div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}

