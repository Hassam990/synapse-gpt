"use client";

import { AiMode, invokeAI, Message } from "@/app/actions";
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
import { Bot, User, Send, Paperclip, Mic, StopCircle } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useChatHistory } from "@/hooks/use-chat-history";

const welcomeMessage = `Assalam-o-Alaikum! Hello there!

I'm SYNAPSE, Pakistan's first GPT-powered AI assistant, a proud creation of Muhammad Jahanzaib Azam. It's a pleasure to connect with you.

How can I assist you today, keeping our unique Pakistani context and culture in mind? Feel free to ask anything!`;

const modeDetails: Record<
  AiMode,
  { title: string; description: string; welcome: string }
> = {
  conversation: {
    title: "Intelligent Conversation",
    description: "Engage in real-time, context-aware conversations.",
    welcome: welcomeMessage,
  },
  assistance: {
    title: "Personalized Assistance",
    description: "Get assistance tailored for Pakistani users.",
    welcome: welcomeMessage,
  },
  information: {
    title: "Information Tool",
    description: "Access knowledge on local business and culture.",
    welcome: welcomeMessage,
  },
  gpt: {
    title: "Full GPT Access",
    description: "Direct access to a full-powered GPT model.",
    welcome: welcomeMessage,
  },
};

export default function ChatInterface({ chatId }: { chatId?: string }) {
  const [selectedMode, setSelectedMode] = useState<AiMode>("conversation");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const { getChat, addMessage, createChat } = useChatHistory();

  useEffect(() => {
    const prompt = searchParams.get('prompt');
    if (prompt && !chatId) {
      setInput(prompt);
      const newChatId = createChat(prompt);
      router.replace(`/chat/${newChatId}?prompt=${encodeURIComponent(prompt)}`);
    }
  }, [searchParams, chatId, createChat, router]);
  
  useEffect(() => {
    if (chatId) {
      const chat = getChat(chatId);
      if (chat) {
        setMessages(chat.messages);
      } else {
        router.push('/chat');
      }
    } else {
      setMessages([
        { role: "assistant", content: modeDetails[selectedMode].welcome },
      ]);
    }
  }, [chatId, selectedMode, getChat, router]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        handleSendMessage(input, dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = (text: string, media?: string) => {
    if ((!text.trim() && !media) || isPending) return;

    const currentChatId = chatId || createChat(text);
    if (!chatId) {
      router.push(`/chat/${currentChatId}`);
    }

    const userMessage: Message = { role: "user", content: text, media };
    setMessages((prev) => [...prev, userMessage]);
    addMessage(currentChatId, userMessage);
    setInput("");

    startTransition(async () => {
      const result = await invokeAI(selectedMode, text, media);
      if (result.success && result.response) {
        const assistantMessage: Message = { role: "assistant", ...result.response };
        setMessages((prev) => [...prev, assistantMessage]);
        addMessage(currentChatId, assistantMessage);
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSendMessage(input);
  };
  
  return (
    <Card className="w-full max-w-4xl h-full md:h-[85vh] flex flex-col shadow-lg bg-transparent border-none">
      <CardHeader className="p-4">
        <div className="flex items-center justify-center">
            <Select
              defaultValue="conversation"
              onValueChange={(value) => setSelectedMode(value as AiMode)}
            >
              <SelectTrigger className="w-full sm:w-[280px] bg-secondary border-border/50">
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
                className={`flex items-start gap-3 sm:gap-4 ${
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
                  className={`rounded-lg p-3 max-w-[80%] sm:max-w-2xl text-sm ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary"
                  }`}
                >
                  {message.media && message.media.startsWith('data:image') && (
                    <img src={message.media} alt="Uploaded content" className="rounded-md mb-2 max-w-xs" />
                  )}
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.audio && (
                    <audio controls src={message.audio} className="w-full mt-2" />
                  )}
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
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            onClick={() => fileInputRef.current?.click()}
            className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0"
          >
            <Paperclip className="h-5 w-5"/>
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isPending}
            className="flex-grow bg-secondary h-10 sm:h-12 focus-visible:ring-primary"
          />
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0"
          >
            <Mic className="h-5 w-5"/>
          </Button>
          <Button type="submit" disabled={isPending || (!input.trim() && !fileInputRef.current?.files?.length)} className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 w-10 sm:h-12 sm:w-12" size="icon">
            <Send className="h-5 w-5"/>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
