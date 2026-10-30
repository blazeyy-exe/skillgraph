import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/config";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { DiscoveryOrchestrator } from "@/lib/ai/discovery/discovery-orchestrator";
import { log } from "@/lib/logging";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    let userId = "demo-user-id";

    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
      userId = user.id;

      // Rate limit check
      const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
      const rateLimitKey = `rate:ai:discovery:${userId}:${clientIp}`;
      if (!checkRateLimit(rateLimitKey, 30, 60 * 1000)) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment." }), {
          status: 429,
          headers: { "Content-Type": "application/json" },
        });
      }
    } else if (!isDemoMode()) {
      return new Response(
        JSON.stringify({ error: "Database or AI not configured. Set .env keys or SKILLGRAPH_DEMO_MODE=true." }),
        { status: 503, headers: { "Content-Type": "application/json" } },
      );
    }

    const body = await req.json();
    const { conversationId, message, forceExtraction } = body;

    if (!conversationId || typeof conversationId !== "string") {
      return new Response(JSON.stringify({ error: "Missing conversationId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      return new Response(JSON.stringify({ error: "Message content cannot be empty" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userMessageText = message.trim();

    // Set up SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        function sendEvent(type: string, data: unknown) {
          const payload = `data: ${JSON.stringify({ type, data })}\n\n`;
          controller.enqueue(encoder.encode(payload));
        }

        try {
          // Process turn via Discovery Orchestrator
          const result = await DiscoveryOrchestrator.processTurn({
            conversationId,
            userMessage: userMessageText,
            userId,
            forceExtraction: Boolean(forceExtraction),
          });

          // Stream reply in natural word chunks for realistic conversational feedback
          const words = result.reply.split(" ");
          for (let i = 0; i < words.length; i++) {
            const chunk = (i === 0 ? "" : " ") + words[i];
            sendEvent("token", chunk);
            // Non-blocking short delay to emulate streaming pacing
            await new Promise((r) => setTimeout(r, 12));
          }

          // Emit complete metadata (analysis, stage, extracted records)
          sendEvent("meta", {
            nextQuestion: result.nextQuestion,
            interviewAnalysis: result.interviewAnalysis,
            extractedExperience: result.extractedExperience,
          });

          sendEvent("done", { success: true });
          controller.close();
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : "Error during discovery turn processing.";
          log.error("discovery_stream_failed", { error: errMsg, conversationId, userId });
          sendEvent("error", { error: errMsg });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
