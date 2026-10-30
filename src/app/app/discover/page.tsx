import { getWorkspace } from "@/lib/data/workspace";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DiscoveryChat } from "@/components/chat/discovery-chat";
import type { DiscoveryMessage } from "@/types/database";

export default async function DiscoverPage() {
  const workspace = await getWorkspace();
  const supabase = await createSupabaseServerClient();
  let conversationId = "demo-conversation";
  let initialMessages: DiscoveryMessage[] = [];

  if (supabase) {
    let { data: conv } = await supabase
      .from("discovery_conversations")
      .select("id")
      .eq("user_id", workspace.userId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!conv) {
      const { data: newConv } = await supabase
        .from("discovery_conversations")
        .insert({
          user_id: workspace.userId,
          title: "Initial Capability Discovery",
          status: "active",
        })
        .select("id")
        .single();
      conv = newConv;
    }

    if (conv) {
      conversationId = conv.id;
      const { data: messages } = await supabase
        .from("discovery_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      initialMessages = (messages as DiscoveryMessage[]) || [];
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-line pb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">Phase 2 — Active</p>
        <h1 className="mt-1 font-serif text-3xl sm:text-4xl">Experience Discovery</h1>
        <p className="mt-1 text-ink-soft text-sm">
          Uncover abilities developed through real-world action. Describe what you have organized, built, resolved, or handled.
        </p>
      </div>

      <DiscoveryChat
        conversationId={conversationId}
        initialMessages={initialMessages}
      />
    </div>
  );
}
