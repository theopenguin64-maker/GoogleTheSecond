import { NextRequest, NextResponse } from 'next/server';
import { getSignedS3Url } from '@/lib/s3';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const s3Key = searchParams.get('key');

    if (!s3Key) {
      return NextResponse.json({ error: 'Query parameter "key" is required' }, { status: 400 });
    }

    // Generate presigned URL valid for 1 hour
    const url = await getSignedS3Url(s3Key, 3600);

    return NextResponse.json({ url });
  } catch (error: any) {
    console.error('PDF URL generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate PDF URL' },
      { status: 500 }
    );
  }
}

