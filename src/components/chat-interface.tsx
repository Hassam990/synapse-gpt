
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
import { prompts, buildUserProfileContext, Language, UserProfileContext } from "@/app/prompts";
import { cn } from "@/lib/utils";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { UserProfile } from "@/services/user-profile-service";
import { collection, addDoc, serverTimestamp, query, orderBy, getDoc, doc } from 'firebase/firestore';


const welcomeMessage = `Assalam-o-Alaikum! Hello there!

I am SYNAPSE, Pakistan's first GPT-powered AI assistant, created by Muhammad Jahanzaib Azam. For logged-in users, I remember our conversations to provide a more personal experience. For guests, my memory is session-based.

How can I assist you today? Feel free to ask anything!`;

export default function ChatInterface({ initialPrompt, chatId }: { initialPrompt?: string | null, chatId?: string }) {
  const [selectedMode, setSelectedMode] = useState<AiMode>("conversation");
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('roman-urdu');
  
  // Local state for guest users or before a chat is created
  const [localMessages, setLocalMessages] = useState<Message[]>([]);

  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();
  
  const { user } = useUser();
  const firestore = useFirestore();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const [audioLoading, setAudioLoading] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const promptHandled = useRef(false);

  // Fetch user profile for personalization
  useEffect(() => {
    if (user && firestore) {
      const profileRef = doc(firestore, 'users', user.uid);
      getDoc(profileRef).then(snap => {
        if (snap.exists()) {
          setUserProfile(snap.data() as UserProfile);
        }
      });
    } else {
      setUserProfile(null);
    }
  }, [user, firestore]);
  
  // Firestore-backed message state for logged-in users
  const messagesQuery = useMemoFirebase(() => {
    if (user && firestore && chatId) {
      return query(collection(firestore, 'users', user.uid, 'chats', chatId, 'messages'), orderBy('timestamp', 'asc'));
    }
    return null;
  }, [user, firestore, chatId]);

  const { data: firestoreMessages, isLoading: isLoadingMessages } = useCollection<Message>(messagesQuery);
  
  const messages = user && chatId ? (firestoreMessages || []) : localMessages;

  const handleSendMessage = useCallback(async (text: string, media?: string) => {
    if ((!text.trim() && !media) || isPending) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content: text,
      timestamp: serverTimestamp(),
      ...(media && { media }),
    };
    
    // Optimistically update UI
    const newMessages = messages.length === 1 && messages[0].content === welcomeMessage
      ? [userMessage]
      : [...messages, userMessage];

    if (!user) { // Guest user
      setLocalMessages(newMessages);
    }

    setInput("");
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    startTransition(async () => {
      let currentChatId = chatId;
      
      try {
        // --- Persistence for logged-in users ---
        if (user && firestore) {
          // If it's a new chat, create it first
          if (!chatId) {
            const chatTitle = text.substring(0, 40) + (text.length > 40 ? '...' : '');
            const chatCollectionRef = collection(firestore, 'users', user.uid, 'chats');
            const newChatDoc = await addDoc(chatCollectionRef, {
              title: chatTitle,
              userId: user.uid,
              createdAt: serverTimestamp(),
            });
            currentChatId = newChatDoc.id;
            // Add the user message to the new chat
            await addDoc(collection(chatCollectionRef, currentChatId, 'messages'), userMessage);
            router.replace(`/chat/${currentChatId}`, { scroll: false });
            // The rest of the flow will be handled by the new page with the chatId
            return; 
          } else {
            // It's an existing chat, just add the message
            await addDoc(collection(firestore, 'users', user.uid, 'chats', currentChatId!, 'messages'), userMessage);
          }
        }
        // --- End Persistence ---

        // Prepare for AI call
        const profileContext = buildUserProfileContext(userProfile);
        const systemPrompt = prompts[selectedMode](selectedLanguage, profileContext);
        
        const assistantMessageId = uuidv4();
        if (!user) { // Optimistic assistant message for guests
            setLocalMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', content: '' }]);
        }

        const result = await invokeAI(systemPrompt, newMessages);
        
        if (result.success && result.response?.content) {
          const reader = result.response.content.getReader();
          let accumulatedContent = '';
          const decoder = new TextDecoder();

          const read = async () => {
            const { done, value } = await reader.read();
            if (done) {
              const finalAssistantMessage: Message = {
                id: assistantMessageId,
                role: 'assistant',
                content: accumulatedContent,
                timestamp: serverTimestamp(),
              };
              if (user && firestore && currentChatId) {
                await addDoc(collection(firestore, 'users', user.uid, 'chats', currentChatId, 'messages'), finalAssistantMessage);
              }
              return;
            }
            
            accumulatedContent += decoder.decode(value, { stream: true });

            if (!user) { // Live update for guest UI
              setLocalMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessageId ? { ...msg, content: accumulatedContent } : msg
                )
              );
            }
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
        if (!user) {
          setLocalMessages(prev => prev.slice(0, -2)); // remove user and assistant placeholder
        }
      }
    });
  }, [isPending, messages, selectedLanguage, selectedMode, toast, user, firestore, chatId, userProfile, router]);


  // Effect to handle initial state (welcome message or initial prompt)
  useEffect(() => {
    const isChatEmpty = messages.length === 0;
    if (initialPrompt && !promptHandled.current && isChatEmpty) {
      handleSendMessage(initialPrompt);
      promptHandled.current = true;
       if (typeof window !== 'undefined') {
        const newUrl = window.location.pathname;
        window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
       }
    } else if (!chatId && isChatEmpty && !isLoadingMessages) {
        setLocalMessages([
          { id: uuidv4(), role: "assistant", content: welcomeMessage },
        ]);
    }
  }, [initialPrompt, handleSendMessage, messages.length, isLoadingMessages, chatId]);
  
  // Effect to scroll to bottom on new messages
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
        const newMessages = messages.map(msg => 
            msg.id === messageId ? { ...msg, audio: result.response.audio } : msg
          );
        // This is tricky with firestore. For now, we don't persist the audio URI.
        setLocalMessages(newMessages);

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
            {isLoadingMessages && (
                 <div className="flex justify-center items-center h-full p-8">
                    <Loader className="h-6 w-6 animate-spin" />
                 </div>
            )}
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
             {isPending && (
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
