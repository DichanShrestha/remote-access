import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { botId, event, sessionId } = body;

        if (!botId || !event) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (event !== "booking_link_shown" && event !== "booking_link_clicked") {
            return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
        }

        await (prisma as any).bookingEvent.create({
            data: {
                botId,
                event,
                sessionId: sessionId || null,
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[Booking Analytics Error]:", error);
        return NextResponse.json({ error: "Failed to record event" }, { status: 500 });
    }
}
