import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Table } from '@/lib/models/table.model';

/**
 * GET /api/tables/info?restaurantId=xxx&tableNumber=1
 * Get table information by restaurant ID and table number
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const tableNumber = searchParams.get('tableNumber');

    if (!restaurantId || !tableNumber) {
      return NextResponse.json(
        { error: 'Restaurant ID and table number are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const table = await Table.findOne({
      restaurantId,
      tableNumber: parseInt(tableNumber)
    });

    if (!table) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      _id: table._id.toString(),
      tableNumber: table.tableNumber,
      status: table.status,
      capacity: table.capacity,
      restaurantId: table.restaurantId,
    });
  } catch (error: any) {
    console.error('Error fetching table info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch table information' },
      { status: 500 }
    );
  }
}