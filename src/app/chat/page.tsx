
'use client';
import ChatInterface from '@/components/chat-interface';
import Link from 'next/link';
import {
  BrainCircuit,
  Plus,
  Settings,
  Bot
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from '@/components/ui/sidebar';
import { Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

function ChatPageContent() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get('prompt');

  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
      <ChatInterface initialPrompt={initialPrompt} />
    </Suspense>
  );
}

export default function ChatPage() {
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
                        <SidebarMenuButton className="w-full justify-start" isActive={true}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Chat
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
            <main className="flex-grow flex flex-col p-1 sm:p-4 overflow-hidden">
              <ChatPageContent />
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
