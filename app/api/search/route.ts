import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { tokenizeText } from '@/lib/pdf';
import { generateSnippets, highlightTerms } from '@/lib/snippets';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
    }

    // Tokenize query
    const queryTokens = tokenizeText(query);
    const uniqueQueryTokens = [...new Set(queryTokens)];

    if (uniqueQueryTokens.length === 0) {
      return NextResponse.json({ results: [] });
    }

    // Find matching files
    const { data: tokensData, error: tokensError } = await supabase
      .from('tokens')
      .select('file_id')
      .in('word', uniqueQueryTokens);

    if (tokensError) throw tokensError;

    // Get unique file IDs
    const fileIds = [...new Set(tokensData.map(t => t.file_id))];

    if (fileIds.length === 0) {
      return NextResponse.json({ results: [] });
    }

    // Get file details with extracted text
    const { data: filesData, error: filesError } = await supabase
      .from('files')
      .select('id, filename, s3_key, extracted_text')
      .in('id', fileIds);

    if (filesError) throw filesError;

    // Generate snippets and highlight matches
    const results = filesData.map(file => {
      const snippets = file.extracted_text
        ? generateSnippets(file.extracted_text, uniqueQueryTokens)
        : ['No text available'];
      
      const highlightedSnippets = snippets.map(snippet =>
        highlightTerms(snippet, uniqueQueryTokens)
      );

      return {
        id: file.id,
        filename: file.filename,
        s3_key: file.s3_key,
        snippets: highlightedSnippets,
      };
    });

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search' },
      { status: 500 }
    );
  }
}

