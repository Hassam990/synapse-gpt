
'use client';
import ChatInterface from '@/components/chat-interface';
import Link from 'next/link';
import {
  Code,
  LogIn,
  LogOut,
  Plus,
  User,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { useAuth, useFirestore, useUser } from '@/firebase';
import { signInAsGuest } from '@/firebase/non-blocking-login';
import { signOut } from 'firebase/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { signInWithGoogle } from '@/firebase/auth-actions';
import RecentChats from '@/components/recent-chats';

function ChatPageContent() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get('prompt');

  return (
      <ChatInterface initialPrompt={initialPrompt} />
  );
}

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" {...props}>
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,35.15,44,28.623,44,20C44,22.659,43.862,21.35,43.611,20.083z"/>
  </svg>
);


export default function ChatPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();

  const handleGoogleLogin = () => {
    if (auth && firestore) {
      signInWithGoogle(auth, firestore);
    }
  };

  const handleGuestLogin = () => {
    if (auth) {
      signInAsGuest(auth);
    }
  };

  const handleLogout = () => {
    if (auth) {
      signOut(auth);
    }
  };

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
                 <SidebarMenuItem>
                    <Link href="/code-builder" className="w-full">
                        <SidebarMenuButton className="w-full justify-start">
                        <Code className="mr-2 h-4 w-4" />
                        Code Builder
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            </SidebarMenu>
             <Suspense fallback={null}><RecentChats /></Suspense>
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
                <div className="flex items-center gap-2 w-full">
                  <Avatar className="h-9 w-9">
                    {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />}
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                       {user.displayName ? user.displayName.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col flex-grow">
                    <p className="text-sm font-semibold truncate">{user.displayName || 'Anonymous User'}</p>
                    <p className="text-xs text-muted-foreground">{user.isAnonymous ? "Guest" : "Member"}</p>
                  </div>
                   <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Sign Out">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                 <div className="w-full space-y-2">
                    <Button onClick={handleGoogleLogin} className="w-full">
                      <GoogleIcon className="mr-2 h-5 w-5" />
                      Sign In with Google
                    </Button>
                    <Button variant="secondary" onClick={handleGuestLogin} className="w-full">
                      <User className="mr-2 h-4 w-4" />
                      Continue as Guest
                    </Button>
                  </div>
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
