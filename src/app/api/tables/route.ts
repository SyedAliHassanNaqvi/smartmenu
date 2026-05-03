import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import { Table } from '@/lib/models/table.model';

/**
 * GET /api/tables
 * Fetch all tables for the authenticated restaurant
 */
export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
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

    const tables = await Table.find({ restaurantId })
      .sort({ tableNumber: 1 })
      .select('_id tableNumber status capacity qrCode lastOccupiedAt createdAt');

    return NextResponse.json(tables);
  } catch (error: any) {
    console.error('Error fetching tables:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tables' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tables
 * Create a new table for the authenticated restaurant
 */
export async function POST(request: NextRequest) {
  try {
    // Get token from Authorization header
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

    const { tableNumber, capacity = 4 } = await request.json();

    if (!tableNumber || tableNumber < 1) {
      return NextResponse.json(
        { error: 'Valid table number is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if table number already exists for this restaurant
    const existingTable = await Table.findOne({ restaurantId, tableNumber });
    if (existingTable) {
      return NextResponse.json(
        { error: 'Table number already exists' },
        { status: 409 }
      );
    }

    const table = new Table({
      restaurantId,
      tableNumber,
      capacity,
      status: 'available',
    });

    await table.save();

    return NextResponse.json(table, { status: 201 });
  } catch (error: any) {
    console.error('Error creating table:', error);
    return NextResponse.json(
      { error: 'Failed to create table' },
      { status: 500 }
    );
  }
}
