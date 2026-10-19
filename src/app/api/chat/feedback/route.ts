import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { authService } from "@/services/auth";

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new Response("Unauthorized", { status: 401 });
        }
        await authService.ensureActive(user.id);
        if (!await prisma.profile.findUnique({ where: { userId: user.id }, select: { id: true } })) {
            return new Response("Creator access required", { status: 403 });
        }

        const { messageId, feedback } = await req.json();

        if (!messageId || !['up', 'down'].includes(feedback)) {
            return new Response("Invalid messageId or feedback", { status: 400 });
        }

        // Since we're in a Playground session, we'll verify the message belongs to a conversation owned by the user
        const message = await (prisma as any).message.findFirst({
            where: {
                id: messageId,
                conversation: {
                    userId: user.id
                }
            }
        });

        if (!message) {
            return new Response("Message not found", { status: 404 });
        }

        await (prisma as any).message.update({
            where: { id: messageId },
            data: { feedback }
        });

        return new Response("OK", { status: 200 });
    } catch (error) {
        console.error("[Feedback API] Error:", error);
        return new Response("Internal server error", { status: 500 });
    }
}
