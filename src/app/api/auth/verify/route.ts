import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import { User } from '@/lib/models/user.model';

/**
 * GET /api/auth/verify
 * Verify JWT token and return user data
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;

    await dbConnect();

    // Get fresh user data from database
    const user = await User.findById(decoded.userId).select('-password');

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'User not found or inactive' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        restaurantId: user.restaurantId,
      }
    });
  } catch (error: any) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}