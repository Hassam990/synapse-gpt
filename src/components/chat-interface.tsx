
"use client";

import { AiMode, invokeAI, Message, generateAudioAction, AiMessage } from "@/app/actions";
import { synapse } from "@/ai/flows/synapse-flow";
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
import { motion, AnimatePresence } from 'framer-motion';
import { prompts, buildUserProfileContext, Language, UserProfileContext } from "@/app/prompts";
import { cn } from "@/lib/utils";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { UserProfile } from "@/services/user-profile-service";
import { collection, addDoc, serverTimestamp, query, orderBy, getDoc, doc, updateDoc } from 'firebase/firestore';


const welcomeMessage = `Assalam-o-Alaikum! Hello there!

I am SYNAPSE, Pakistan's first GPT-powered AI assistant, created by Muhammad Jahanzaib Azam. For logged-in users, I remember our conversations to provide a more personal experience. For guests, my memory is session-based.

How can I assist you today? Feel free to ask anything!`;

export default function ChatInterface({ initialPrompt, chatId }: { initialPrompt?: string | null, chatId?: string }) {
  const [selectedMode, setSelectedMode] = useState<AiMode>("conversation");
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('roman-urdu');
  
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
  
  const messagesQuery = useMemoFirebase(() => {
    if (user && firestore && chatId) {
      return query(collection(firestore, 'users', user.uid, 'chats', chatId, 'messages'), orderBy('timestamp', 'asc'));
    }
    return null;
  }, [user, firestore, chatId]);

  const { data: firestoreMessages, isLoading: isLoadingMessages } = useCollection<Message>(messagesQuery);
  
  const messages = user && chatId ? (firestoreMessages || []) : localMessages;

  const triggerAIResponse = useCallback(async (currentMessages: Message[]) => {
    if (currentMessages.length === 0 || isPending) return;

    startTransition(() => {
        (async () => {
            const guestAssistantMessageId = user ? null : uuidv4();
            
            try {
                // For guests, add a placeholder while we wait for the AI response.
                if (guestAssistantMessageId) {
                    const placeholder: Message = { id: guestAssistantMessageId, role: 'assistant', content: '' };
                    setLocalMessages(prev => [...prev, placeholder]);
                }
                
                const profileContext = buildUserProfileContext(userProfile);
                const systemPrompt = prompts[selectedMode](selectedLanguage, profileContext);
                
                const messagesForAI: AiMessage[] = currentMessages.map(({ role, content, media }) => ({
                    role,
                    content: content || '',
                    ...(media && { media }),
                }));
                
                const aiMessageId = user ? uuidv4() : guestAssistantMessageId!;
                
                // Fetch from the new API route instead of direct server action to avoid serialization errors
                const response = await fetch('/api/chat', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ systemPrompt, messages: messagesForAI }),
                });

                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.error || "Failed to start AI stream.");
                }

                const reader = response.body?.getReader();
                if (!reader) throw new Error("No reader available for the AI stream.");

                const decoder = new TextDecoder();
                let accumulatedContent = "";

                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;
                  
                  const chunk = decoder.decode(value, { stream: true });
                  accumulatedContent += chunk;

                  if (user && firestore && chatId) {
                    // Update the UI via local state for real-time streaming feel even for logged-in users
                    setLocalMessages(prev => {
                      const exists = prev.find(m => m.id === aiMessageId);
                      if (exists) {
                        return prev.map(m => m.id === aiMessageId ? { ...m, content: accumulatedContent } : m);
                      }
                      return [...prev, { id: aiMessageId, role: 'assistant', content: accumulatedContent }];
                    });
                  } else if (guestAssistantMessageId) {
                    setLocalMessages(prev => prev.map(msg => msg.id === guestAssistantMessageId ? { ...msg, content: accumulatedContent } : msg));
                  }
                }

                if (user && firestore && chatId) {
                    // Final sync to Firestore
                    await addDoc(collection(firestore, 'users', user.uid, 'chats', chatId, 'messages'), {
                        role: 'assistant',
                        content: accumulatedContent,
                        timestamp: serverTimestamp(),
                    });
                    await updateDoc(doc(firestore, 'users', user.uid, 'chats', chatId), { lastMessageTimestamp: serverTimestamp() });
                }

            } catch (error) {
                 const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
                 toast({ variant: "destructive", title: "Error from AI", description: errorMessage });
                 // If there was an error, remove the guest placeholder.
                 if (guestAssistantMessageId) {
                    setLocalMessages(prev => prev.filter(msg => msg.id !== guestAssistantMessageId));
                 }
            }
        })();
    });
  }, [isPending, user, firestore, chatId, userProfile, selectedMode, selectedLanguage, toast]);

  const handleSendMessage = useCallback(async (text: string, media?: string) => {
    if ((!text.trim() && !media) || isPending) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content: text,
      timestamp: serverTimestamp(),
      ...(media && { media }),
    };

    setInput("");
    if (fileInputRef.current) fileInputRef.current.value = '';

    if (user && firestore) {
      if (!chatId) { // This is a new chat being created
        const chatTitle = text.substring(0, 40) + (text.length > 40 ? '...' : '');
        const chatCollectionRef = collection(firestore, 'users', user.uid, 'chats');
        try {
            const newChatDoc = await addDoc(chatCollectionRef, {
                title: chatTitle,
                userId: user.uid,
                createdAt: serverTimestamp(),
                lastMessageTimestamp: serverTimestamp(),
            });
            const newChatId = newChatDoc.id;
            await addDoc(collection(chatCollectionRef, newChatId, 'messages'), userMessage);
            router.replace(`/chat/${newChatId}`, { scroll: false });
            // For new chats, trigger AI with just the first message
            await triggerAIResponse([userMessage]);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error creating chat', description: error instanceof Error ? error.message : String(error) });
        }
      } else if (chatId) { // This is an existing chat
          try {
            await addDoc(collection(firestore, 'users', user.uid, 'chats', chatId, 'messages'), userMessage);
            await updateDoc(doc(firestore, 'users', user.uid, 'chats', chatId), { lastMessageTimestamp: serverTimestamp() });
            // For existing chats, trigger AI with context
            await triggerAIResponse([...messages, userMessage]);
          } catch (error) {
             toast({ variant: 'destructive', title: 'Error sending message', description: error instanceof Error ? error.message : String(error) });
          }
      }
    } else { // This is a guest user
      const newMessages = messages.length === 1 && messages[0].content === welcomeMessage
        ? [userMessage]
        : [...messages, userMessage];
      setLocalMessages(newMessages);
      // For guests, trigger AI
      await triggerAIResponse(newMessages);
    }
  }, [isPending, user, firestore, chatId, router, toast, messages, triggerAIResponse]);

  // Effect to handle initial prompt from homepage
  useEffect(() => {
    const isChatEmpty = messages.length === 0 || (messages.length === 1 && messages[0].content === welcomeMessage);
    if (initialPrompt && !promptHandled.current && isChatEmpty) {
      handleSendMessage(initialPrompt);
      promptHandled.current = true;
       if (typeof window !== 'undefined') {
        const newUrl = window.location.pathname;
        window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
       }
    }
  }, [initialPrompt, handleSendMessage, messages]);

  // Effect to set initial welcome message for guests or new chats
  useEffect(() => {
    if (!chatId && messages.length === 0 && !isLoadingMessages) {
        setLocalMessages([
          { id: uuidv4(), role: "assistant", content: welcomeMessage },
        ]);
    }
  }, [chatId, messages.length, isLoadingMessages]);
  
  // Effect to scroll to bottom on new messages
  useEffect(() => {
    setTimeout(() => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
          top: scrollAreaRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 100);
  }, [messages, isPending]);

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
        if(user && firestore && chatId) {
            const messageRef = doc(firestore, 'users', user.uid, 'chats', chatId, 'messages', messageId);
            await updateDoc(messageRef, { audio: result.response.audio });

        } else {
             const newMessages = messages.map(msg => 
                msg.id === messageId ? { ...msg, audio: result.response.audio } : msg
            );
            setLocalMessages(newMessages);
        }
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
    <div className="w-full h-full flex flex-col bg-transparent relative">
      <header className="sticky top-4 w-[98%] glass rounded-3xl p-3 border-white/20 flex flex-row justify-between items-center gap-2 z-50 shadow-2xl mt-4 self-center">
        <div className="flex items-center gap-2 flex-grow overflow-hidden px-2">
            <Select
            value={selectedMode}
            onValueChange={(value) => setSelectedMode(value as AiMode)}
            >
            <motion.div whileHover={{ scale: 1.02 }} className="w-full">
                <SelectTrigger className="w-full bg-transparent border-none text-foreground text-sm h-8 hover:bg-white/5 transition-colors focus:ring-0">
                <SelectValue placeholder="Mode" />
                </SelectTrigger>
            </motion.div>
            <SelectContent className="glass border-white/10 rounded-2xl">
                <SelectItem value="conversation">Synapse 1.1 (Standard)</SelectItem>
                <SelectItem value="assistance">Synapse Ultra (Creative)</SelectItem>
                <SelectItem value="information">Synapse Lite (Fast)</SelectItem>
                <SelectItem value="gpt">Synapse Pro (Advanced)</SelectItem>
            </SelectContent>
            </Select>
            <div className="w-[1px] h-4 bg-white/10" />
            <Select
            value={selectedLanguage}
            onValueChange={(value) => setSelectedLanguage(value as Language)}
            >
            <motion.div whileHover={{ scale: 1.02 }} className="w-full">
                <SelectTrigger className="w-full bg-transparent border-none text-foreground text-sm h-8 hover:bg-white/5 transition-colors focus:ring-0">
                <SelectValue placeholder="Language" />
                </SelectTrigger>
            </motion.div>
            <SelectContent className="glass border-white/10 rounded-2xl">
                <SelectItem value="roman-urdu">Roman Urdu</SelectItem>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="pashto">Pashto</SelectItem>
                <SelectItem value="sindhi">Sindhi</SelectItem>
            </SelectContent>
            </Select>
        </div>
      </header>

      <main className="flex-grow w-full overflow-hidden relative">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="space-y-6 p-4 md:p-8 w-full pb-40">
            {isLoadingMessages && (
                 <div className="flex justify-center items-center h-full p-8">
                    <Loader className="h-6 w-6 animate-spin" />
                 </div>
            )}
            {messages.map((message, index) => (
              <motion.div
                key={message.id || index}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={cn("flex items-start gap-4 w-full",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 10 }}
                      className="flex-shrink-0 h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20 z-10"
                    >
                        <Bot className="h-6 w-6 md:h-7 md:w-7 text-primary-foreground" />
                    </motion.div>
                )}
                <div
                  className={cn(
                    "rounded-3xl p-4 md:p-5 w-fit max-w-[85%] shadow-2xl transition-all duration-300 relative group",
                    message.role === "user"
                      ? "bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground font-medium shadow-primary/30 ml-auto rounded-tr-sm border border-white/10"
                      : "bg-white/5 text-white shadow-black/40 rounded-tl-sm border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors"
                  )}
                >
                  {message.media && message.media.startsWith('data:image') && (
                    <motion.img 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      src={message.media} 
                      alt="Uploaded content" 
                      className="rounded-2xl mb-3 max-w-full h-auto border border-white/10 shadow-lg" 
                    />
                  )}
                  {message.content ? (
                     <div className="prose prose-invert max-w-none text-sm md:text-base leading-relaxed">
                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                     </div>
                  ) : ( isPending && message.role === 'assistant' && (
                      <div className="flex items-center space-x-2 py-2 px-1">
                        <span className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce"></span>
                      </div>
                    )
                  )}
                   {message.role === 'assistant' && message.content && (
                     <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-3 flex items-center gap-2 border-t border-white/5 pt-3"
                     >
                      {!message.audio && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleGenerateAudio(message.id!, message.content)}
                          disabled={audioLoading === message.id}
                          className="h-8 w-8 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                          aria-label="Generate audio"
                        >
                          {audioLoading === message.id ? (
                            <Loader className="h-4 w-4 animate-spin text-primary" />
                          ) : (
                            <Volume2 className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      {message.audio && (
                        <div className="w-full bg-white/5 rounded-2xl p-2 border border-white/10">
                            <audio controls src={message.audio} className="w-full h-8 opacity-70 hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
             {isPending && !user && (
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
            {isPending && user && (
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

      <footer className="sticky bottom-0 w-full flex justify-center pb-8 pt-4 px-4 bg-gradient-to-t from-background via-background/80 to-transparent">
        <div className="max-w-4xl w-full">
            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-secondary/40 backdrop-blur-3xl border border-white/10 p-2 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] group focus-within:border-primary/30 transition-all duration-300"
            >
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
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
                        className="h-11 w-11 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
                        aria-label="Attach file"
                    >
                        <Paperclip className="h-5 w-5"/>
                    </Button>
                    
                    <div className="relative flex-grow">
                        <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask anything..."
                        disabled={isPending}
                        className="w-full bg-transparent border-none h-11 px-2 text-sm md:text-base focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/40"
                        />
                    </div>

                    <div className="flex items-center gap-1.5 pr-1">
                        <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="h-11 w-11 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
                            aria-label="Use microphone"
                        >
                            <Mic className="h-5 w-5"/>
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={isPending || (!input.trim() && !fileInputRef.current?.files?.length)} 
                            className={cn(
                                "h-11 w-11 rounded-full transition-all duration-300 shadow-xl",
                                isPending || (!input.trim() && !fileInputRef.current?.files?.length)
                                    ? "bg-muted text-muted-foreground"
                                    : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20 hover:scale-105 active:scale-95"
                            )}
                            size="icon" 
                            aria-label="Send message"
                        >
                            {isPending ? <Loader className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5"/>}
                        </Button>
                    </div>
                </form>
            </motion.div>
            <p className="text-[10px] text-center mt-3 text-muted-foreground/50 font-medium tracking-tight">
                SYNAPSE may provide inaccurate information. Verify important details.
            </p>
        </div>
      </footer>
    </div>
  );
}
