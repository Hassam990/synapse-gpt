"use client";

import { AiMode, invokeAI } from "@/app/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Bot, User, Send } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const modeDetails: Record<
  AiMode,
  { title: string; description: string; welcome: string }
> = {
  conversation: {
    title: "Intelligent Conversation",
    description: "Engage in real-time, context-aware conversations.",
    welcome:
      "Welcome to Synapse! I'm ready to chat. How can I help you today?",
  },
  assistance: {
    title: "Personalized Assistance",
    description: "Get assistance tailored for Pakistani users.",
    welcome:
      "Hello! I'm here to provide personalized assistance. What do you need help with?",
  },
  information: {
    title: "Information Tool",
    description: "Access knowledge on local business and culture.",
    welcome:
      "I have access to a wealth of information about Pakistan. What would you like to know?",
  },
  gpt: {
    title: "Full GPT Access",
    description: "Direct access to a full-powered GPT model.",
    welcome:
      "You now have full access to a powerful GPT model. Ask me anything.",
  },
};

export default function ChatInterface() {
  const [selectedMode, setSelectedMode] = useState<AiMode>("conversation");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      { role: "assistant", content: modeDetails[selectedMode].welcome },
    ]);
  }, [selectedMode]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    startTransition(async () => {
      const result = await invokeAI(selectedMode, input);
      if (result.success) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: result.response },
        ]);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
        setMessages((prev) => prev.slice(0, prev.length - 1));
      }
    });
  };

  return (
    <Card className="w-full max-w-4xl h-[85vh] flex flex-col shadow-lg bg-transparent border-none">
      <CardHeader className="p-4">
        <div className="flex items-center justify-center">
            <Select
              defaultValue="conversation"
              onValueChange={(value) => setSelectedMode(value as AiMode)}
            >
              <SelectTrigger className="w-[280px] bg-secondary border-border/50">
                <SelectValue placeholder="Select a mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conversation">Intelligent Conversation</SelectItem>
                <SelectItem value="assistance">Personalized Assistance</SelectItem>
                <SelectItem value="information">Information Tool</SelectItem>
                <SelectItem value="gpt">Full GPT Access</SelectItem>
              </SelectContent>
            </Select>
        </div>
      </CardHeader>

      <CardContent className="flex-grow p-4 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="space-y-6 pr-4 max-w-3xl mx-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start gap-4 ${
                  message.role === "user" ? "justify-end" : ""
                }`}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8 border-2 border-primary">
                    <AvatarFallback className="bg-secondary">
                      <Bot className="h-5 w-5 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-lg p-3 max-w-2xl text-sm ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <Avatar className="h-8 w-8 border-2 border-muted">
                    <AvatarFallback className="bg-secondary text-foreground">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isPending && (
              <div className="flex items-start gap-4">
                <Avatar className="h-8 w-8 border-2 border-primary">
                  <AvatarFallback className="bg-secondary">
                    <Bot className="h-5 w-5 text-primary animate-pulse" />
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-lg p-3 max-w-2xl text-sm bg-secondary">
                  <div className="flex items-center space-x-1">
                    <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse"></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-4 border-t-0">
        <form onSubmit={handleSubmit} className="w-full flex gap-2 max-w-3xl mx-auto">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isPending}
            className="flex-grow bg-secondary h-12 focus-visible:ring-primary"
          />
          <Button type="submit" disabled={isPending || !input.trim()} className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-12" size="icon">
            <Send className="h-5 w-5"/>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
