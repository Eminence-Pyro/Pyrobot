'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '@/store/userStore';
import { useChatStore } from '@/store/chatStore';
import { chatService } from '@/services/chat-service';
import { ChatTopBar } from '@/components/chat/ChatTopBar';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { StreamingBubble } from '@/components/chat/StreamingBubble';
import { ChatInputBar } from '@/components/chat/ChatInputBar';
import { ConversationSheet } from '@/components/chat/ConversationSheet';
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
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', id],
    queryFn: () => chatService.listMessages(id, accessToken!),
    enabled: !!accessToken && !!id,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming.streamingContent]);

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      appendStreamingToken('');
      const exchange = await chatService.sendMessage(
        id,
        { content, model: selectedModel },
        accessToken!,
      );
      return exchange;
    },
    onSuccess: (exchange) => {
      finalizeStream(exchange.assistant_message);
      queryClient.invalidateQueries({ queryKey: ['messages', id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: () => {
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

  return (
    <>
      <ChatTopBar onOpenSheet={() => setSheetOpen(true)} />

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

        <StreamingBubble />
        <div ref={messagesEndRef} />
      </div>

      <ChatInputBar
        onSend={(content) => sendMessage.mutate(content)}
        disabled={sendMessage.isPending}
      />

      <ConversationSheet
        currentId={id}
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />
    </>
  );
}