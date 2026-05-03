import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import { Product } from '@/lib/models/product.model';

/**
 * GET /api/products?restaurantId=xxx
 * Fetch all products/menu items for a specific restaurant
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const products = await Product.find({ restaurantId, isAvailable: true })
      .sort({ category: 1, name: 1 })
      .select('_id name description price category image isAvailable restaurantId');

    return NextResponse.json(products);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products
 * Create a new product/menu item for the authenticated restaurant
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

    const productData = await request.json();
    const { name, description, price, category, image } = productData;

    if (!name || !price || !category) {
      return NextResponse.json(
        { error: 'Name, price, and category are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const product = new Product({
      restaurantId,
      name,
      description,
      price: parseFloat(price),
      category,
      image,
      isAvailable: true,
    });

    await product.save();

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}