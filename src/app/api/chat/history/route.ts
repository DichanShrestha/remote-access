import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/chat/history?botId=xxx&visitorId=yyy
 * Returns the previous chat messages for a returning anonymous visitor.
 * Limited to last 50 messages to keep payload small.
 */
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

        const sessionIdParam = searchParams.get("sessionId");

        // If no sessionId specified, find the most recent session for this visitor
        let targetSessionId = sessionIdParam;
        if (!targetSessionId) {
            const latestMsg = await prisma.chatMessage.findFirst({
                where: { botId, visitorId },
                orderBy: { createdAt: "desc" },
                select: { sessionId: true },
            });
            targetSessionId = latestMsg?.sessionId || null;
        }

        let messages: any[] = [];
        if (targetSessionId) {
            messages = await prisma.chatMessage.findMany({
                where: { botId, visitorId, sessionId: targetSessionId },
                orderBy: { createdAt: "desc" },
                take: 50,
                select: {
                    id: true,
                    role: true,
                    content: true,
                    sessionId: true,
                    createdAt: true,
                },
            });
            messages.reverse();
        }

        // Also check if a lead was already captured for this visitor
        const existingLead = await prisma.botLead.findFirst({
            where: { botId, visitorId },
            select: { id: true },
        });

        return NextResponse.json(
            {
                messages,
                hasExistingLead: !!existingLead,
                sessionId: messages[0]?.sessionId || null,
            },
            { headers: corsHeaders() }
        );
    } catch (error) {
        console.error("[Chat History API] Error:", error);
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
