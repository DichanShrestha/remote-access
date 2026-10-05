import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const botId = searchParams.get("botId")?.trim() || "";
        const visitorId = searchParams.get("visitorId")?.trim() || null;

        if (!botId || !visitorId) {
            return NextResponse.json(
                { error: "Missing botId or visitorId" },
                { status: 400, headers: corsHeaders() }
            );
        }

        // Fetch messages for this visitor on this bot to group by session
        const messages = await prisma.chatMessage.findMany({
            where: { botId, visitorId },
            orderBy: { createdAt: "desc" },
            select: {
                sessionId: true,
                role: true,
                content: true,
                createdAt: true,
            },
        });

        // Group into sessions mapping: sessionId -> { id, preview, createdAt }
        const sessionsMap = new Map<string, { id: string, preview: string, createdAt: Date }>();

        for (const msg of messages) {
            if (!sessionsMap.has(msg.sessionId)) {
                sessionsMap.set(msg.sessionId, {
                    id: msg.sessionId,
                    createdAt: msg.createdAt, // Since desc, this is the latest message's time, or we can use the first message's time 
                    preview: msg.role === "user" ? msg.content : "Chat Session",
                });
            } else if (msg.role === "user") {
                // Keep updating preview to the oldest user message if we prefer,
                // but since we want the first message they sent:
                sessionsMap.get(msg.sessionId)!.preview = msg.content;
            }
        }

        const sessions = Array.from(sessionsMap.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        return NextResponse.json(sessions, { headers: corsHeaders() });
    } catch (error) {
        console.error("[Chat Sessions API] Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers: corsHeaders() }
        );
    }
}

export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: corsHeaders(),
    });
}

function corsHeaders(): HeadersInit {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
    };
}
