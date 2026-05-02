import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';

/**
 * GET /api/tables
 * Fetch all tables with their occupancy status
 */
export async function GET(request: NextRequest) {
  // Mock data to return quickly - primary response
  const mockTables = [
    { _id: '1', number: 1, occupancy: 0, status: 'available' },
    { _id: '2', number: 2, occupancy: 0, status: 'available' },
    { _id: '3', number: 3, occupancy: 0, status: 'available' },
    { _id: '4', number: 4, occupancy: 0, status: 'available' },
    { _id: '5', number: 5, occupancy: 0, status: 'available' },
    { _id: '6', number: 6, occupancy: 2, status: 'occupied' },
  ];

  try {
    // Try to connect to database with a timeout, but return mock data immediately
    const dbPromise = (async () => {
      try {
        await dbConnect();
        console.log("Database connected");
        // Could fetch real data here if needed
        return mockTables;
      } catch (dbError) {
        console.warn('Database connection failed, using mock data:', dbError);
        return mockTables;
      }
    })();

    // Wait maximum 2 seconds for database, otherwise return mock data
    const result = await Promise.race([
      dbPromise,
      new Promise<typeof mockTables>(resolve => 
        setTimeout(() => {
          console.log('Database took too long, returning mock data immediately');
          resolve(mockTables);
        }, 2000)
      ),
    ]);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching tables:', error);
    return NextResponse.json(mockTables); // Return mock data on any error
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
