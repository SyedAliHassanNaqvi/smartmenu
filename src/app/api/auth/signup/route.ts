import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import dbConnect from '@/lib/db';
import { Invitation } from '@/lib/models/invitation.model';
import { Restaurant } from '@/lib/models/restaurant.model';
import { User } from '@/lib/models/user.model';

/**
 * POST /api/auth/signup
 * Create admin account using invitation token
 */
export async function POST(request: Request) {
  try {
    const { token, password, restaurantDetails } = await request.json();

    if (!token || !password || !restaurantDetails) {
      return NextResponse.json(
        { error: 'Token, password, and restaurant details are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find and validate invitation
    const invitation = await Invitation.findOne({
      invitationToken: token,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation token' },
        { status: 404 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create restaurant
    const restaurant = new Restaurant({
      name: invitation.restaurantName,
      ownerEmail: invitation.email,
      ownerName: restaurantDetails.ownerName,
      phone: restaurantDetails.phone,
      address: restaurantDetails.address,
      theme: restaurantDetails.theme || 'default',
      subscription: {
        plan: 'basic', // Based on payment amount
        status: 'active',
        paymentId: invitation.paymentId,
        amount: invitation.amount,
        currency: invitation.currency,
      },
      settings: {
        currency: invitation.currency,
        timezone: restaurantDetails.timezone || 'Europe/Rome',
        language: restaurantDetails.language || 'en',
      },
    });

    await restaurant.save();

    // Create admin user
    const user = new User({
      email: invitation.email,
      password: hashedPassword,
      name: restaurantDetails.ownerName,
      role: 'admin',
      restaurantId: restaurant._id.toString(),
      isActive: true,
    });

    await user.save();

    // Mark invitation as used
    invitation.status = 'used';
    await invitation.save();

    return NextResponse.json({
      success: true,
      restaurantId: restaurant._id.toString(),
      userId: user._id.toString(),
      message: 'Restaurant and admin account created successfully'
    });
  } catch (error: any) {
    console.error('Error creating admin account:', error);
    return NextResponse.json(
      { error: 'Failed to create admin account' },
      { status: 500 }
    );
  }
}