import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import { Table } from '@/lib/models/table.model';

/**
 * PUT /api/tables/[id]
 * Update a table
 */
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const params = await Promise.resolve(context.params);
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

    const { tableNumber, capacity, status, location } = await request.json();

    await dbConnect();

    const table = await Table.findOne({
      _id: params.id,
      restaurantId,
    });

    if (!table) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      );
    }

    // Check if new table number already exists (exclude current table)
    if (tableNumber && tableNumber !== table.tableNumber) {
      const existingTable = await Table.findOne({
        restaurantId,
        tableNumber,
        _id: { $ne: params.id },
      });
      if (existingTable) {
        return NextResponse.json(
          { error: 'Table number already exists' },
          { status: 409 }
        );
      }
    }

    // Update fields
    if (tableNumber) table.tableNumber = tableNumber;
    if (capacity) table.capacity = capacity;
    if (status) table.status = status;
    if (location) table.location = location;

    await table.save();

    return NextResponse.json(table);
  } catch (error: any) {
    console.error('Error updating table:', error);
    return NextResponse.json(
      { error: 'Failed to update table' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tables/[id]
 * Delete a table
 */
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  const params = await Promise.resolve(context.params);
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

    const table = await Table.findOneAndDelete({
      _id: params.id,
      restaurantId,
    });

    if (!table) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Table deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting table:', error);
    return NextResponse.json(
      { error: 'Failed to delete table' },
      { status: 500 }
    );
  }
}
