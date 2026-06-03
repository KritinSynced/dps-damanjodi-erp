import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { paymentId, method } = await req.json();

    if (!paymentId || !method) {
      return NextResponse.json(
        { success: false, error: "Missing Payment ID or Method" },
        { status: 400 }
      );
    }

    // Generate transaction metadata
    const transactionId = "TXN" + Math.floor(10000000 + Math.random() * 90000000);
    const receiptNo = "REC-2026-" + Math.floor(1000 + Math.random() * 9000);

    const updatedPayment = await prisma.feePayment.update({
      where: { id: paymentId },
      data: {
        status: "PAID",
        paidDate: new Date(),
        paymentMethod: method,
        transactionId,
        receiptNo,
      },
    });

    return NextResponse.json({
      success: true,
      payment: updatedPayment,
    });
  } catch (error: any) {
    console.error("Pay Fee API Error:", error);
    return NextResponse.json(
      { success: false, error: "Server error executing fee payment" },
      { status: 500 }
    );
  }
}
