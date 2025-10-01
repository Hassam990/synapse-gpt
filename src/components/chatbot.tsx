'use client';

import { useState, useTransition } from 'react';
import { invokeAI } from '@/app/actions';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { v4 as uuidv4 } from 'uuid';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatBot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = { id: uuidv4(), role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    const assistantMessageId = uuidv4();
    setMessages((prev) => [...prev, { id: assistantMessageId, role: 'assistant', content: '' }]);
    setInput('');

    startTransition(async () => {
        try {
            // Using the 'gpt' mode for a general-purpose chat experience as defined in prompts.ts
            const result = await invokeAI('gpt', input, 'english');
            if (result.success && result.response?.content) {
                const reader = result.response.content.getReader();
                let accumulatedContent = '';

                const read = async () => {
                    const { done, value } = await reader.read();
                    if (done) {
                        return;
                    }
                    accumulatedContent += value;
                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === assistantMessageId
                                ? { ...msg, content: accumulatedContent }
                                : msg
                        )
                    );
                    read();
                };
                read();
            } else {
                throw new Error(result.error || 'An unknown error occurred.');
            }
        } catch (error) {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === assistantMessageId
                        ? { ...msg, content: `Error: ${error instanceof Error ? error.message : 'Could not get response.'}` }
                        : msg
                )
            );
        }
    });
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[60vh] bg-secondary/50 rounded-lg border border-border/30">
      <div className="flex-grow p-4 space-y-4 overflow-y-auto">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ${
                message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background'
              }`}
            >
              {message.content || (message.role === 'assistant' && 'Typing...')}
            </div>
          </div>
        ))}
         {isPending && messages.at(-1)?.role === 'assistant' && messages.at(-1)?.content === '' && (
            <div className="flex justify-start">
                 <div className="rounded-lg px-4 py-2 bg-background">
                  <div className="flex items-center space-x-1">
                    <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse"></span>
                  </div>
                </div>
            </div>
         )}
      </div>
      <div className="p-4 border-t border-border/30">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isPending}
            className="flex-grow bg-background h-10 rounded-full focus-visible:ring-primary pr-4"
          />
          <Button type="submit" disabled={isPending || !input.trim()}>
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
