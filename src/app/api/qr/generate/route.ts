import { NextRequest, NextResponse } from 'next/server';
import { generateTableQR, isValidTableId } from '@/services/qr-service';

/**
 * POST /api/qr/generate
 * Generate a QR code for a table
 * 
 * Request body:
 * {
 *   "tableId": "table-1"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "tableId": "table-1",
 *   "qrCode": "data:image/png;base64,...",
 *   "url": "http://localhost:3000/customer/table-1"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tableId } = body;

    // Validate input
    if (!tableId || !isValidTableId(tableId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid tableId provided' },
        { status: 400 }
      );
    }

    // Generate QR code
    const qrCode = await generateTableQR(tableId);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const url = `${appUrl}/customer/${tableId}`;

    return NextResponse.json(
      {
        success: true,
        tableId,
        qrCode,
        url,
        generatedAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('QR generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate QR code',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/qr/generate?tableId=table-1
 * Generate a QR code for a table (GET method)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tableId = searchParams.get('tableId');

    if (!tableId || !isValidTableId(tableId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid tableId parameter' },
        { status: 400 }
      );
    }

    const qrCode = await generateTableQR(tableId);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const url = `${appUrl}/customer/${tableId}`;

    return NextResponse.json(
      {
        success: true,
        tableId,
        qrCode,
        url,
        generatedAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('QR generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate QR code',
      },
      { status: 500 }
    );
  }
}
