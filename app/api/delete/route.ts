import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { deleteFromS3 } from '@/lib/s3';

export async function DELETE(request: NextRequest) {
  try {
    const { fileId } = await request.json();

    if (!fileId) {
      return NextResponse.json({ error: 'fileId is required' }, { status: 400 });
    }

    // Get file info to get S3 key
    const { data: fileData, error: fileError } = await supabase
      .from('files')
      .select('s3_key')
      .eq('id', fileId)
      .single();

    if (fileError || !fileData) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Delete from S3
    await deleteFromS3(fileData.s3_key).catch((err) => {
      console.error('S3 delete error (continuing with DB delete):', err);
    });

    // Delete from database (cascade will handle tokens)
    const { error: deleteError } = await supabase
      .from('files')
      .delete()
      .eq('id', fileId);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete file' },
      { status: 500 }
    );
  }
}

