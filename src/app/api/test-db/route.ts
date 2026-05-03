import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';

export async function GET() {
  try {
    try {
      await dbConnect();
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json(
        { 
          status: 'error', 
          message: dbError instanceof Error ? dbError.message : 'Database connection failed',
          timestamp: new Date().toISOString()
        },
        { status: 503 }
      );
    }
    
    const connectionState = mongoose.connection.readyState;
    const states: { [key: number]: string } = {
      0: 'Disconnected',
      1: 'Connected',
      2: 'Connecting',
      3: 'Disconnecting',
    };

    if (connectionState !== 1) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Database did not reach connected state',
          database: states[connectionState] || 'Unknown',
          readyState: connectionState,
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }

    return NextResponse.json({ 
      status: 'success',
      message: 'Database connected!',
      database: states[connectionState] || 'Unknown',
      readyState: connectionState,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database test failed:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}