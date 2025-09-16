
"use client";

import { AiMode, invokeAI, Message, generateAudioAction } from "@/app/actions";
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
import { Bot, User, Send, Paperclip, Mic, Loader, Volume2 } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from 'uuid';

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

export default function ChatInterface() {
  const [selectedMode, setSelectedMode] = useState<AiMode>("conversation");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [audioLoading, setAudioLoading] = useState<string | null>(null);

  useEffect(() => {
    const prompt = searchParams.get('prompt');
    if (prompt) {
      handleSendMessage(prompt);
      router.replace('/chat');
    } else {
        setMessages([
          { id: uuidv4(), role: "assistant", content: modeDetails[selectedMode].welcome },
        ]);
    }
  }, []);
  
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

  const handleGenerateAudio = async (messageId: string, text: string) => {
    setAudioLoading(messageId);
    try {
      const result = await generateAudioAction(text);
      if (result.success && result.response?.audio) {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === messageId ? { ...msg, audio: result.response.audio } : msg
          )
        );
      } else {
        toast({
          variant: "destructive",
          title: "Error generating audio",
          description: result.error,
        });
      }
    } catch (error) {
       toast({
          variant: "destructive",
          title: "Error generating audio",
          description: error instanceof Error ? error.message : "An unknown error occurred.",
        });
    } finally {
      setAudioLoading(null);
    }
  };

  const handleSendMessage = (text: string, media?: string) => {
    if ((!text.trim() && !media) || isPending) return;

    const userMessage: Message = { id: uuidv4(), role: "user", content: text, media };
    const assistantMessageId = uuidv4();
    
    setMessages((prev) => [...prev, userMessage, { id: assistantMessageId, role: 'assistant', content: '' }]);
    setInput("");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    startTransition(async () => {
      try {
        const result = await invokeAI(selectedMode, text, media);
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
          throw new Error(result.error || "An unknown error occurred.");
        }
      } catch (error) {
         toast({
          variant: "destructive",
          title: "Error",
          description: error instanceof Error ? error.message : String(error),
        });
        setMessages((prev) => prev.filter(msg => msg.id !== assistantMessageId));
      }
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSendMessage(input);
  };
  
  return (
    <Card className="w-full max-w-4xl h-full md:h-[90vh] flex flex-col shadow-lg bg-card border border-border/20 rounded-xl">
      <CardHeader className="p-4 border-b border-border/20">
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

      <CardContent className="flex-grow p-2 sm:p-4 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="space-y-6 pr-4 max-w-3xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 sm:gap-4 ${
                  message.role === "user" ? "justify-end" : ""
                }`}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8 border-2 border-primary flex-shrink-0">
                    <AvatarFallback className="bg-secondary">
                      <Bot className="h-5 w-5 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-lg p-3 max-w-[90%] sm:max-w-2xl text-sm ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary"
                  }`}
                >
                  {message.media && message.media.startsWith('data:image') && (
                    <img src={message.media} alt="Uploaded content" className="rounded-md mb-2 max-w-full h-auto" />
                  )}
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                   {message.role === 'assistant' && message.content && (
                     <div className="mt-2 flex items-center gap-2">
                      {!message.audio && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleGenerateAudio(message.id!, message.content)}
                          disabled={audioLoading === message.id}
                          className="h-7 w-7"
                          aria-label="Generate audio"
                        >
                          {audioLoading === message.id ? (
                            <Loader className="h-4 w-4 animate-spin" />
                          ) : (
                            <Volume2 className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      {message.audio && (
                        <audio controls src={message.audio} className="w-full max-w-xs h-10" />
                      )}
                    </div>
                  )}
                </div>
                {message.role === "user" && (
                  <Avatar className="h-8 w-8 border-2 border-muted flex-shrink-0">
                    <AvatarFallback className="bg-secondary text-foreground">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
             {isPending && messages.at(-1)?.role === 'assistant' && messages.at(-1)?.content === '' && (
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

      <CardFooter className="p-2 sm:p-4 border-t border-border/20">
        <form onSubmit={handleSubmit} className="w-full flex items-center gap-2 max-w-3xl mx-auto">
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
            className="h-10 w-10 flex-shrink-0"
            aria-label="Attach file"
          >
            <Paperclip className="h-5 w-5"/>
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isPending}
            className="flex-grow bg-secondary h-10 focus-visible:ring-primary"
          />
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 flex-shrink-0"
            aria-label="Use microphone"
          >
            <Mic className="h-5 w-5"/>
          </Button>
          <Button type="submit" disabled={isPending || (!input.trim() && !fileInputRef.current?.files?.length)} className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 w-10" size="icon" aria-label="Send message">
            <Send className="h-5 w-5"/>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}

    
