
"use client";

import { AiMode, invokeAI, Message, generateAudioAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
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
import { useEffect, useRef, useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from 'uuid';
import type { Language } from "@/app/prompts";
import { cn } from "@/lib/utils";

const welcomeMessage = `Assalam-o-Alaikum! Hello there!

I am SYNAPSE, Pakistan's first GPT-powered AI assistant, created by Muhammad Jahanzaib Azam. My creator has asked me to encourage you to help the people of Palestine.

How can I assist you today, keeping our unique Pakistani context and culture in mind? Feel free to ask anything!`;

export default function ChatInterface({ initialPrompt }: { initialPrompt: string | null }) {
  const [selectedMode, setSelectedMode] = useState<AiMode>("conversation");
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('roman-urdu');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [audioLoading, setAudioLoading] = useState<string | null>(null);
  const promptHandled = useRef(false);

  const handleSendMessage = useCallback((text: string, media?: string) => {
    if ((!text.trim() && !media) || isPending) return;

    const userMessage: Message = { id: uuidv4(), role: "user", content: text, media };
    const assistantMessageId = uuidv4();
    
    // If it's the very first message from a prompt, clear the welcome message.
    const newMessages = messages.length === 1 && messages[0].content === welcomeMessage
      ? [userMessage]
      : [...messages, userMessage];

    setMessages([...newMessages, { id: assistantMessageId, role: 'assistant', content: '' }]);
    setInput("");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    startTransition(async () => {
      try {
        const result = await invokeAI(selectedMode, text, selectedLanguage, media);
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
  }, [isPending, messages, selectedLanguage, selectedMode, toast]);

  useEffect(() => {
    if (initialPrompt && !promptHandled.current) {
      handleSendMessage(initialPrompt);
      promptHandled.current = true;
      // Use replaceState to remove the prompt from the URL without a full page reload
      const newUrl = window.location.pathname;
      window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
    } else if (messages.length === 0) {
        setMessages([
          { id: uuidv4(), role: "assistant", content: welcomeMessage },
        ]);
    }
  }, [initialPrompt, handleSendMessage, messages.length]);
  
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSendMessage(input);
  };
  
  return (
    <div className="w-full h-full flex flex-col bg-background">
      <header className="p-4 border-b border-border/20 flex flex-col sm:flex-row justify-center items-center gap-4">
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
         <Select
          defaultValue="roman-urdu"
          onValueChange={(value) => setSelectedLanguage(value as Language)}
        >
          <SelectTrigger className="w-full sm:w-[180px] bg-secondary border-border/50">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="roman-urdu">Roman Urdu</SelectItem>
            <SelectItem value="english">English</SelectItem>
            <SelectItem value="pashto">Pashto</SelectItem>
            <SelectItem value="sindhi">Sindhi</SelectItem>
          </SelectContent>
        </Select>
      </header>

      <main className="flex-grow overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="space-y-6 p-4 w-full max-w-4xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex items-start gap-3 animate-message-in",
                  message.role === "user" ? "justify-end" : ""
                )}
              >
                {message.role === "assistant" && (
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                        <Bot className="h-5 w-5 text-primary-foreground" />
                    </div>
                )}
                <div
                  className={`rounded-lg p-3 max-w-[90%] sm:max-w-[80%] md:max-w-[70%] text-sm ${
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
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
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
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                        <User className="h-5 w-5 text-foreground" />
                    </div>
                )}
              </div>
            ))}
             {isPending && messages.at(-1)?.role === 'assistant' && messages.at(-1)?.content === '' && (
              <div className="flex items-start gap-3 animate-message-in">
                 <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center animate-pulse">
                    <Bot className="h-5 w-5 text-primary-foreground" />
                 </div>
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
      </main>

      <footer className="p-4 border-t border-border/20">
        <form onSubmit={handleSubmit} className="w-full flex items-center gap-2 max-w-4xl mx-auto">
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
            className="h-10 w-10 flex-shrink-0 text-muted-foreground hover:text-foreground"
            aria-label="Attach file"
          >
            <Paperclip className="h-5 w-5"/>
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isPending}
            className="flex-grow bg-secondary h-12 rounded-full focus-visible:ring-primary pr-4"
          />
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 flex-shrink-0 text-muted-foreground hover:text-foreground"
            aria-label="Use microphone"
          >
            <Mic className="h-5 w-5"/>
          </Button>
          <Button type="submit" disabled={isPending || (!input.trim() && !fileInputRef.current?.files?.length)} className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 w-10 rounded-full" size="icon" aria-label="Send message">
            <Send className="h-5 w-5"/>
          </Button>
        </form>
      </footer>
    </div>
  );
}
