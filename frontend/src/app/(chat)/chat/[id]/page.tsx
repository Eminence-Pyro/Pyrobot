'use client';

import { useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '@/store/userStore';
import { useChatStore } from '@/store/chatStore';
import { chatService } from '@/services/chat-service';
import { conversationService } from '@/services/conversation-service';
import { ChatTopBar } from '@/components/chat/ChatTopBar';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { StreamingBubble } from '@/components/chat/StreamingBubble';
import { ChatInputBar } from '@/components/chat/ChatInputBar';
import type { Message } from '@/types/chat.types';

export default function ChatSessionPage() {
  const { id } = useParams<{ id: string }>();
  const { accessToken } = useUserStore();
  const {
    selectedModel,
    appendStreamingToken,
    finalizeStream,
    streaming,
  } = useChatStore();

  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages for this conversation
  const { data: messages = [] } = useQuery({
    queryKey: ['messages', id],
    queryFn: () => chatService.listMessages(id, accessToken!),
    enabled: !!accessToken && !!id,
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming.streamingContent]);

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      // Start streaming state — show thinking dots immediately
      appendStreamingToken('');

      // Simulate typewriter effect while waiting for response
      // This gives visual feedback without true SSE (Stage 5.3 fast-follow)
      const exchange = await chatService.sendMessage(
        id,
        { content, model: selectedModel },
        accessToken!,
      );

      return exchange;
    },
    onSuccess: (exchange) => {
      // Finalize — replace streaming buffer with real saved message
      finalizeStream(exchange.assistant_message);
      // Invalidate so message list + conversation list both refresh
      queryClient.invalidateQueries({ queryKey: ['messages', id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: () => {
      // Clear streaming state on failure
      finalizeStream({
        id: 'error',
        conversation_id: id,
        role: 'assistant',
        content: 'Something went wrong. Please try again.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Message);
    },
  });

  const handleSend = (content: string) => {
    sendMessage.mutate(content);
  };

  return (
    <>
      <ChatTopBar />

      {/* Message list */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.length === 0 && !streaming.isStreaming && (
          <div className="flex flex-col items-center justify-center h-full text-center px-8 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center">
              <span className="text-2xl">✦</span>
            </div>
            <p className="text-body text-muted-foreground">
              Send a message to start the conversation
            </p>
          </div>
        )}

        {messages.map((message: Message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {/* Streaming bubble — visible while AI is responding */}
        <StreamingBubble />

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      <ChatInputBar
        onSend={handleSend}
        disabled={sendMessage.isPending}
      />
    </>
  );
}