
"use client";

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import Link from 'next/link';
import { MessageSquare, Search, X, Trash2 } from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import { Skeleton } from './ui/skeleton';
import { Input } from './ui/input';
import { useState } from 'react';
import { deleteDoc, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function RecentChats() {
  const [searchQuery, setSearchQuery] = useState("");
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const pathname = usePathname();
  const { toast } = useToast();

  const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user || !firestore) return;

    if (confirm("Are you sure you want to delete this chat? This action cannot be undone.")) {
        try {
            const chatRef = doc(firestore, 'users', user.uid, 'chats', chatId);
            await deleteDoc(chatRef);
            toast({ title: "Chat deleted", description: "The conversation has been permanently removed." });
        } catch (error) {
            toast({ 
                variant: "destructive", 
                title: "Error deleting chat", 
                description: error instanceof Error ? error.message : "Failed to delete chat" 
            });
        }
    }
  };

  const chatsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'users', user.uid, 'chats'),
      orderBy('lastMessageTimestamp', 'desc')
    );
  }, [user, firestore]);

  const { data: chats, isLoading } = useCollection<{ id: string; title: string; lastMessageTimestamp: any }>(chatsQuery);

  if (isUserLoading || (user && isLoading)) {
      return (
          <div className="p-2 mt-4 space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
          </div>
      );
  }

  // Don't show anything for guest users
  if (!user) {
    return null;
  }

  if (!chats || chats.length === 0) {
    return (
      <div className="p-4 text-sm text-center text-muted-foreground">No recent chats.</div>
    );
  }
  
  const filteredChats = chats?.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SidebarGroup className="mt-4">
        <div className="px-4 mb-4">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recent Chats</h2>
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                    placeholder="Search chats..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 bg-white/5 border-white/10 rounded-xl focus-visible:ring-primary/20 transition-all text-xs"
                />
                {searchQuery && (
                    <button 
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                    >
                        <X className="h-3 w-3 text-muted-foreground" />
                    </button>
                )}
            </div>
        </div>
        <SidebarGroupContent>
            <SidebarMenu>
            {filteredChats && filteredChats.length > 0 ? (
                filteredChats.map((chat) => (
                    <SidebarMenuItem key={chat.id} className="group/item relative">
                    <Link href={`/chat/${chat.id}`} className="w-full">
                        <SidebarMenuButton 
                        className={cn(
                            "text-sm font-normal justify-start w-full h-10 px-4 transition-all duration-200",
                            pathname === `/chat/${chat.id}` 
                                ? "bg-primary/10 text-primary border-r-2 border-primary" 
                                : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                        )}
                        isActive={pathname === `/chat/${chat.id}`}
                        >
                        <MessageSquare className={cn("mr-2 h-4 w-4", pathname === `/chat/${chat.id}` ? "text-primary" : "text-muted-foreground")} />
                        <span className="truncate pr-8">{chat.title}</span>
                        </SidebarMenuButton>
                    </Link>
                    <button 
                        onClick={(e) => handleDeleteChat(e, chat.id)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-lg opacity-0 group-hover/item:opacity-100 hover:bg-destructive/20 hover:text-destructive transition-all duration-200 z-10"
                        title="Delete chat"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                    </SidebarMenuItem>
                ))
            ) : (
                <div className="px-4 py-8 text-center">
                    <p className="text-xs text-muted-foreground">No chats found.</p>
                </div>
            )}
            </SidebarMenu>
        </SidebarGroupContent>
    </SidebarGroup>
  );
}

// Helper to handle class merging if not globally available in this context
function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}


    