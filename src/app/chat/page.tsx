
'use client';
import ChatInterface from '@/components/chat-interface';
import Link from 'next/link';
import {
  LogIn,
  LogOut,
  Plus,
  User,
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
import { useAuth, useUser } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { signOut } from 'firebase/auth';
import { Skeleton } from '@/components/ui/skeleton';

function ChatPageContent() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get('prompt');

  return (
      <ChatInterface initialPrompt={initialPrompt} />
  );
}

export default function ChatPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  
  const handleLogin = () => {
    initiateAnonymousSignIn(auth);
  };

  const handleLogout = () => {
    signOut(auth);
  }

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
              {isUserLoading ? (
                 <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="flex flex-col gap-1">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
              ) : user ? (
                <div className="flex items-center gap-2">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-sm font-semibold">Anonymous User</p>
                    <p className="text-xs text-muted-foreground">Guest</p>
                  </div>
                </div>
              ) : (
                 <Button onClick={handleLogin} className="w-full">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              )}
               {user && (
                <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Sign Out">
                  <LogOut className="h-4 w-4" />
                </Button>
              )}
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <div className="flex flex-col h-screen">
             <header className="p-4 flex justify-end md:hidden flex-shrink-0">
                <SidebarTrigger />
            </header>
            <main className="flex-grow flex flex-col p-1 sm:p-4 overflow-hidden">
              <Suspense fallback={<div className="flex items-center justify-center h-full">Loading...</div>}>
                <ChatPageContent />
              </Suspense>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
