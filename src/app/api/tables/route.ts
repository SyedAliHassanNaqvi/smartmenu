import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';

/**
 * GET /api/tables
 * Fetch all tables with their occupancy status
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // For now, return mock data since Table model might not be fully set up
    // In production, fetch from database: const tables = await Table.find({});
    
    const mockTables = [
      { _id: '1', number: 1, occupancy: 0, status: 'available' },
      { _id: '2', number: 2, occupancy: 0, status: 'available' },
      { _id: '3', number: 3, occupancy: 0, status: 'available' },
      { _id: '4', number: 4, occupancy: 0, status: 'available' },
      { _id: '5', number: 5, occupancy: 0, status: 'available' },
      { _id: '6', number: 6, occupancy: 2, status: 'occupied' },
    ];

    return NextResponse.json(mockTables);
  } catch (error: any) {
    console.error('Error fetching tables:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tables' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tables
 * Create a new table
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { number, capacity } = body;

    if (!number || number < 1) {
      return NextResponse.json(
        { error: 'Invalid table number' },
        { status: 400 }
      );
    }

    // TODO: Create table in database
    // const table = await Table.create({ number, capacity, occupancy: 0, status: 'available' });

    const newTable = {
      _id: Date.now().toString(),
      number,
      capacity: capacity || 4,
      occupancy: 0,
      status: 'available',
    };

    return NextResponse.json(newTable, { status: 201 });
  } catch (error: any) {
    console.error('Error creating table:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create table' },
      { status: 400 }
    );
  }
}
