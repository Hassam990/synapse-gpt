"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { useChatHistory, Chat } from '@/hooks/use-chat-history';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

export default function RecentChats() {
  const { getRecentChats } = useChatHistory();
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    // This effect ensures that we only access localStorage on the client side
    setChats(getRecentChats());
  }, [getRecentChats]);
  
  // A simple loading state
  if (!chats.length) {
    return (
      <div className="p-4 text-sm text-muted-foreground">No recent chats.</div>
    );
  }

  return (
    <SidebarMenu>
      {chats.map((chat) => (
        <SidebarMenuItem key={chat.id}>
          <Link href={`/chat/${chat.id}`} className="w-full">
            <SidebarMenuButton className="text-sm font-normal justify-start w-full">
              <MessageSquare className="h-4 w-4" />
              <div className="flex flex-col items-start truncate">
                <span className="truncate">{chat.title}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(chat.timestamp).toLocaleDateString()}
                </span>
              </div>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
