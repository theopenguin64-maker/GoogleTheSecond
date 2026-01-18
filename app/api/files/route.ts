import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('files')
      .select('id, filename, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ files: data || [] });
  } catch (error: any) {
    console.error('Get files error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch files' },
      { status: 500 }
    );
  }
}

