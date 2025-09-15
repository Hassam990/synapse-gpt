'use client';
import ChatInterface from '@/components/chat-interface';
import Link from 'next/link';
import {
  BrainCircuit,
  Plus,
  Settings
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
} from '@/components/ui/sidebar';
import { Suspense } from 'react';

function ChatPageContent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatInterface />
    </Suspense>
  );
}


export default function ChatPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
      <Sidebar collapsible="icon" className="border-r border-border/20">
          <SidebarHeader>
          <Link href="/" className="flex items-center gap-2 pl-2">
              <div className="bg-foreground p-1.5 rounded-lg">
                <BrainCircuit className="h-6 w-6 text-background" />
              </div>
              <div className="flex flex-col">
                <h2 className="font-headline text-lg font-bold text-primary">SYNAPSE</h2>
                <p className="text-xs text-muted-foreground -mt-1">
                  Pakistan's First GPT
                </p>
              </div>
            </Link>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <Link href="/chat">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                New Chat
              </Button>
            </Link>
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
             <header className="p-4 flex justify-end md:hidden">
                <SidebarTrigger />
            </header>
            <main className="flex-grow flex items-center justify-center p-4">
              <ChatPageContent />
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
