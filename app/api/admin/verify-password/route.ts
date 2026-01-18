import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'; // Default for development

    if (password === adminPassword) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }
  } catch (error: any) {
    console.error('Password verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify password' },
      { status: 500 }
    );
  }
}
