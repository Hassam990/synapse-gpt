'use client';

import Link from 'next/link';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Bot,
  Plus,
  Settings,
  MessageSquare,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ChatBot from '@/components/chatbot';

export default function ChatbotPage() {
  const router = useRouter();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar collapsible="icon" className="border-r border-border/20">
          <SidebarHeader>
            <Link href="/" className="flex items-center gap-2 px-2">
              <Image src="https://raw.githubusercontent.com/Hassam990/synapse/refs/heads/main/Synapse.png" alt="SynapseGPT Logo" width={160} height={40} />
            </Link>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarMenu>
                 <SidebarMenuItem>
                    <Link href="/chat" className="w-full">
                        <SidebarMenuButton className="w-full justify-start">
                        <Plus className="mr-2 h-4 w-4" />
                        New Chat
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <Link href="/chatbot" className="w-full">
                        <SidebarMenuButton className="w-full justify-start" isActive={true}>
                        <Bot className="mr-2 h-4 w-4" />
                        AI Chatbot
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                    JA
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-sm font-semibold">Muhammad Jahanzaib</p>
                  <p className="text-xs text-muted-foreground">CEO & Founder</p>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
            <div className="flex flex-col h-screen">
                <header className="p-4 flex justify-end md:hidden flex-shrink-0">
                    <SidebarTrigger />
                </header>
                <main className="flex-1 overflow-y-auto p-4">
                    <div className="flex flex-col items-center text-center mb-8">
                        <h1 className="text-2xl font-bold">AI Chatbot</h1>
                        <p className="text-muted-foreground">A simple chatbot using the existing AI flow.</p>
                    </div>
                    <ChatBot />
                </main>
            </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
