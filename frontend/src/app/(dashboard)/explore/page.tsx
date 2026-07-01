"use client";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "@/store/userStore";
import { conversationService } from "@/services/conversation-service";
import { PageTransition } from "@/components/providers/PageTransition";

const TOOLS = [
  {
    id: "smart-chat",
    icon: "💬",
    name: "Smart Chat",
    desc: "Get instant answers and engage in natural conversations.",
    prompt: "Let's have a smart conversation. How can I help you today?",
  },
  {
    id: "doc-assistant",
    icon: "📄",
    name: "Document Assistant",
    desc: "Summarize, analyze, and extract insights from any document.",
    prompt: "I'm ready to help you with a document. Paste the text or describe what you need.",
  },
  {
    id: "ai-writer",
    icon: "✏️",
    name: "AI Writer",
    desc: "Create high-quality content tailored to your needs.",
    prompt: "Let's write something great. What would you like me to help you create?",
  },
  {
    id: "data-analyst",
    icon: "📊",
    name: "Data Analyst",
    desc: "Analyze data, visualize trends, and uncover key insights.",
    prompt: "Share your data and I'll help you analyze it and uncover insights.",
  },
  {
    id: "idea-generator",
    icon: "💡",
    name: "Idea Generator",
    desc: "Spark creativity and generate ideas for any project.",
    prompt: "I'm in idea-generation mode. Tell me your topic and I'll brainstorm with you.",
  },
  {
    id: "task-planner",
    icon: "✅",
    name: "Task Planner",
    desc: "Break down tasks, set goals, and stay productive.",
    prompt: "Let's plan your tasks. Tell me what you want to achieve and I'll help break it down.",
  },
];

export default function ExplorePage() {
  const { accessToken } = useUserStore();
  const router          = useRouter();
  const queryClient     = useQueryClient();

  const createTool = useMutation({
    mutationFn: (tool: typeof TOOLS[0]) =>
      conversationService.create({ title: tool.name }, accessToken!),
    onSuccess: (c) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      router.push(`/chat/${c.id}`);
    },
  });

  return (
    <PageTransition>
      {/* Dark hero header — matches mockup 2 screen 3 */}
      <div
        className="px-5 pt-8 pb-6"
        style={{
          background: "var(--background)",
        }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <h1
            className="font-black text-foreground"
            style={{ fontSize: "1.625rem", lineHeight: 1.2, letterSpacing: "-0.02em" }}
          >
            What can I do for you?
          </h1>
          <p className="text-caption text-muted-foreground mt-2">
            Powerful AI tools. Endless potential.
          </p>
        </div>
      </div>

      {/* ── Tool grid ── */}
      <div className="px-4 pb-8 max-w-2xl mx-auto w-full">
        <div className="grid grid-cols-2 gap-3">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => createTool.mutate(tool)}
              disabled={createTool.isPending}
              className="tool-card text-left"
            >
              {/* Icon */}
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3"
                style={{
                  background: "rgba(212,146,14,0.12)",
                  border: "1px solid rgba(212,146,14,0.2)",
                  fontSize: "1.4rem",
                }}
              >
                {tool.icon}
              </div>

              <div>
                <p className="text-caption font-bold text-foreground">{tool.name}</p>
                <p className="text-micro text-muted-foreground mt-0.5 leading-relaxed">
                  {tool.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
