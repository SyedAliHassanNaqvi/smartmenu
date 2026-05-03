import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import { Table } from '@/lib/models/table.model';
import { generateTableQR } from '@/services/qr-service';

/**
 * POST /api/qr/generate
 * Generate a QR code for a table
 *
 * Request body:
 * {
 *   "tableId": "mongodb-table-id"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "tableId": "mongodb-table-id",
 *   "qrCode": "data:image/png;base64,...",
 *   "url": "http://localhost:3000/customer/restaurant-id/table-number"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    const restaurantId = decoded.restaurantId;

    if (!restaurantId) {
      return NextResponse.json(
        { success: false, error: 'Restaurant ID not found in token' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { tableId } = body;

    // Validate input
    if (!tableId) {
      return NextResponse.json(
        { success: false, error: 'Table ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find table and verify it belongs to the restaurant
    const table = await Table.findOne({ _id: tableId, restaurantId });
    if (!table) {
      return NextResponse.json(
        { success: false, error: 'Table not found or access denied' },
        { status: 404 }
      );
    }

    // Generate QR code with restaurant context
    const qrCode = await generateTableQR(`${restaurantId}/${table.tableNumber}`);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const url = `${appUrl}/customer/${restaurantId}/${table.tableNumber}`;

    // Update table with QR code URL
    table.qrCode = url;
    await table.save();

    return NextResponse.json(
      {
        success: true,
        tableId: table._id.toString(),
        tableNumber: table.tableNumber,
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
 * GET /api/qr/generate?tableId=mongodb-table-id
 * Generate a QR code for a table (GET method)
 */
export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    const restaurantId = decoded.restaurantId;

    if (!restaurantId) {
      return NextResponse.json(
        { success: false, error: 'Restaurant ID not found in token' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const tableId = searchParams.get('tableId');

    if (!tableId) {
      return NextResponse.json(
        { success: false, error: 'Table ID parameter is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find table and verify it belongs to the restaurant
    const table = await Table.findOne({ _id: tableId, restaurantId });
    if (!table) {
      return NextResponse.json(
        { success: false, error: 'Table not found or access denied' },
        { status: 404 }
      );
    }

    const qrCode = await generateTableQR(`${restaurantId}/${table.tableNumber}`);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const url = `${appUrl}/customer/${restaurantId}/${table.tableNumber}`;

    // Update table with QR code URL
    table.qrCode = url;
    await table.save();

    return NextResponse.json(
      {
        success: true,
        tableId: table._id.toString(),
        tableNumber: table.tableNumber,
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
