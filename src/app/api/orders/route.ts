import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Order } from "@/lib/models/order.model";
import { createOrderSchema } from "@/lib/validations/order";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const validatedData = createOrderSchema.parse(body);

    const order = await Order.create(validatedData);
    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const tableId = searchParams.get("tableId");
    const status = searchParams.get("status");

    let query: any = {};
    if (tableId) query.tableId = tableId;
    if (status) query.status = status;

    const orders = await Order.find(query).sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch orders" },
      { status: 400 }
    );
  }
}
