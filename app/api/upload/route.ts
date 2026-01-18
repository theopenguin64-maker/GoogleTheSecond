import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { uploadToS3, deleteFromS3 } from '@/lib/s3';
import { extractTextFromPDF, tokenizeText } from '@/lib/pdf';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }

    // Generate S3 key
    const fileId = uuidv4();
    const s3Key = `pdfs/${fileId}-${file.name}`;

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to S3
    await uploadToS3(s3Key, buffer, file.type);

    // Extract text from PDF
    const extractedText = await extractTextFromPDF(buffer);

    // Tokenize text
    const tokens = tokenizeText(extractedText);
    const uniqueTokens = [...new Set(tokens)];

    // Insert file record
    const { data: fileData, error: fileError } = await supabase
      .from('files')
      .insert({
        id: fileId,
        filename: file.name,
        s3_key: s3Key,
        extracted_text: extractedText,
      })
      .select()
      .single();

    if (fileError) {
      // Clean up S3 if DB insert fails
      await deleteFromS3(s3Key).catch(() => {});
      throw fileError;
    }

    // Insert tokens
    if (uniqueTokens.length > 0) {
      const tokenRows = uniqueTokens.map(word => ({
        word,
        file_id: fileId,
      }));

      const { error: tokenError } = await supabase
        .from('tokens')
        .insert(tokenRows);

      if (tokenError) {
        // Clean up on error
        await supabase.from('files').delete().eq('id', fileId);
        await deleteFromS3(s3Key).catch(() => {});
        throw tokenError;
      }
    }

    return NextResponse.json({
      success: true,
      file: fileData,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}

