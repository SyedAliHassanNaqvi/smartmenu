import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Invitation } from '@/lib/models/invitation.model';

/**
 * GET /api/auth/validate-invitation?token=UNIQUE_HASH_123
 * Validate invitation token and return invitation details
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Invitation token is required' },
        { status: 400 }
      );
    }

    await dbConnect();

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

    return NextResponse.json({
      valid: true,
      restaurantName: invitation.restaurantName,
      email: invitation.email,
      amount: invitation.amount,
      currency: invitation.currency,
    });
  } catch (error: any) {
    console.error('Error validating invitation:', error);
    return NextResponse.json(
      { error: 'Failed to validate invitation' },
      { status: 500 }
    );
  }
}