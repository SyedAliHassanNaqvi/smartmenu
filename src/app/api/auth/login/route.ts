import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User } from '@/lib/models/user.model';
import jwt from 'jsonwebtoken';

/**
 * POST /api/auth/login
 * Authenticate admin user
 */
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ email, isActive: true });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        restaurantId: user.restaurantId,
        role: user.role,
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        restaurantId: user.restaurantId,
      }
    });
  } catch (error: any) {
    console.error('Error logging in:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}