
"use client";

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import { Skeleton } from './ui/skeleton';

export default function RecentChats() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const pathname = usePathname();

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
  
  return (
    <div className="mt-4">
        <h2 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent Chats</h2>
        <SidebarMenu>
        {chats.map((chat) => (
            <SidebarMenuItem key={chat.id}>
            <Link href={`/chat/${chat.id}`} className="w-full">
                <SidebarMenuButton 
                className="text-sm font-normal justify-start w-full"
                isActive={pathname === `/chat/${chat.id}`}
                >
                <MessageSquare className="mr-2 h-4 w-4" />
                <span className="truncate">{chat.title}</span>
                </SidebarMenuButton>
            </Link>
            </SidebarMenuItem>
        ))}
        </SidebarMenu>
    </div>
  );
}

    