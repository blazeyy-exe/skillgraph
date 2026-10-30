import { getWorkspace } from "@/lib/data/workspace";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/config";
import { DiscoveryChat } from "@/components/chat/discovery-chat";
import type {
  DiscoveryConversation,
  DiscoveryMessage,
  Experience,
  ExperienceTask,
  SkillSuggestion,
} from "@/types/database";

export default async function DiscoverPage() {
  const workspace = await getWorkspace();
  const supabase = await createSupabaseServerClient();

  let conversationId = "demo-conversation";
  let conversations: DiscoveryConversation[] = [];
  let initialMessages: DiscoveryMessage[] = [];
  let experience: Experience | undefined = undefined;
  let tasks: ExperienceTask[] = [];
  let suggestions: SkillSuggestion[] = [];
  let initialStage: DiscoveryConversation["current_interview_stage"] = "initial";
  let initialSummary = "";

  if (supabase) {
    // 1. Fetch conversations for user
    const { data: convList } = await supabase
      .from("discovery_conversations")
      .select("*")
      .eq("user_id", workspace.userId)
      .order("updated_at", { ascending: false });

    conversations = (convList as DiscoveryConversation[]) || [];

    let activeConv = conversations.find((c) => c.status === "active") || conversations[0];

    // If no conversation exists yet, create the first one
    if (!activeConv) {
      const { data: newConv } = await supabase
        .from("discovery_conversations")
        .insert({
          user_id: workspace.userId,
          title: "Initial Capability Discovery",
          status: "active",
          current_interview_stage: "initial",
        })
        .select("*")
        .single();

      if (newConv) {
        activeConv = newConv as DiscoveryConversation;
        conversations = [activeConv];
      }
    }

    if (activeConv) {
      conversationId = activeConv.id;
      initialStage = activeConv.current_interview_stage;
      initialSummary = activeConv.context_summary || "";

      // 2. Fetch user-facing messages (excluding system messages)
      const { data: messages } = await supabase
        .from("discovery_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .neq("role", "system")
        .order("created_at", { ascending: true });

      initialMessages = (messages as DiscoveryMessage[]) || [];

      // 3. Fetch any extracted experience linked to this conversation
      const { data: expData } = await supabase
        .from("experiences")
        .select("*")
        .eq("conversation_id", conversationId)
        .eq("user_id", workspace.userId)
        .maybeSingle();

      if (expData) {
        experience = expData as Experience;

        const [{ data: tasksData }, { data: suggData }] = await Promise.all([
          supabase
            .from("experience_tasks")
            .select("*")
            .eq("experience_id", experience.id)
            .order("created_at", { ascending: true }),
          supabase
            .from("skill_suggestions")
            .select("*")
            .eq("experience_id", experience.id),
        ]);

        tasks = (tasksData as ExperienceTask[]) || [];
        suggestions = (suggData as SkillSuggestion[]) || [];
      }
    }
  } else if (isDemoMode()) {
    conversationId = "demo-conv-1";
    conversations = [
      {
        id: conversationId,
        user_id: workspace.userId,
        title: "Community Workshop Coordination",
        status: "active",
        context_summary: "Organized workshop sessions with volunteer logistics and merchant sponsorships.",
        current_interview_stage: "investigating_tasks",
        context_snapshot: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        completed_at: null,
      },
    ];
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-line pb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">
          Phase 2 — Active
        </p>
        <h1 className="mt-1 font-serif text-3xl sm:text-4xl">Experience Discovery</h1>
        <p className="mt-1 text-ink-soft text-sm">
          Uncover abilities developed through real-world action. Describe what you have organized, built, resolved, or handled.
        </p>
      </div>

      <DiscoveryChat
        initialConversationId={conversationId}
        initialMessages={initialMessages}
        initialConversations={conversations}
        initialExperience={experience}
        initialTasks={tasks}
        initialSuggestions={suggestions}
        initialStage={initialStage}
        initialSummary={initialSummary}
      />
    </div>
  );
}
