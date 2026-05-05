import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import { Table } from '@/lib/models/table.model';
import { generateTableQR } from '@/services/qr-service';

/**
 * GET /api/qr/codes
 * Fetch all QR codes for tables belonging to the authenticated restaurant
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    const restaurantId = decoded.restaurantId;

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Restaurant ID not found in token' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Fetch all tables with QR code URLs
    const tables = await Table.find({ restaurantId })
      .select('_id tableNumber capacity qrCode status')
      .sort({ tableNumber: 1 });

    // Generate QR code images for tables that have URLs
    const qrCodes = await Promise.all(
      tables.map(async (table) => {
        let qrCode = '';
        if (table.qrCode) {
          try {
            qrCode = await generateTableQR(`${restaurantId}/${table.tableNumber}`);
          } catch (err) {
            console.error(`Failed to generate QR for table ${table.tableNumber}:`, err);
          }
        }
        return {
          tableId: table._id.toString(),
          tableNumber: table.tableNumber,
          capacity: table.capacity,
          status: table.status,
          url: table.qrCode,
          qrCode,
          generatedAt: table.updatedAt,
        };
      })
    );

    return NextResponse.json(qrCodes);
  } catch (error: any) {
    console.error('Error fetching QR codes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch QR codes' },
      { status: 500 }
    );
  }
}
