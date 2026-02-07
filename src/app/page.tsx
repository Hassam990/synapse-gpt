
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
  SidebarMenuButton
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Bot,
  Briefcase,
  Code,
  GraduationCap,
  Lightbulb,
  LogIn,
  LogOut,
  PenSquare,
  Plus,
  Send,
  Settings,
  User,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { signInAsGuest } from '@/firebase/non-blocking-login';
import { signOut } from 'firebase/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { signInWithGoogle } from '@/firebase/auth-actions';

const suggestionCards = [
  {
    icon: Bot,
    title: 'Intelligent Conversations',
    description: 'Real-time AI chat with Pakistani context and cultural understanding',
    prompt: 'Tell me something interesting about Pakistani culture.',
  },
  {
    icon: Briefcase,
    title: 'Business Solutions',
    description: 'Proposals, market analysis, and business assistance for Pakistani market',
    prompt: 'Draft a business proposal for a new e-commerce startup in Lahore.',
  },
  {
    icon: GraduationCap,
    title: 'Educational Support',
    description: 'Learning assistance in Urdu and English with local examples',
    prompt: 'Explain the significance of the Lahore Resolution in simple terms.',
  },
  {
    icon: PenSquare,
    title: 'Creative Writing',
    description: 'Poetry, stories, and content with Pakistani cultural context',
    prompt: 'Write a short poem about the beauty of the Karakoram Highway.',
  },
];

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" {...props}>
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,35.15,44,28.623,44,20C44,22.659,43.862,21.35,43.611,20.083z"/>
  </svg>
);


export default function Home() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();


  const handlePromptSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const prompt = formData.get('prompt') as string;
    if (prompt) {
      router.push(`/chat?prompt=${encodeURIComponent(prompt)}`);
    }
  };
  
  const handleCopyIBAN = () => {
    const iban = 'PK35MEZN0002140100861151';
    navigator.clipboard.writeText(iban);
    toast({
      title: 'IBAN Copied!',
      description: 'The bank account IBAN has been copied to your clipboard.',
    });
  };

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
    if(auth) {
      signOut(auth);
    }
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
                        <SidebarMenuButton className="w-full justify-start">
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
                <main className="flex-1 overflow-y-auto p-4">
                    <div className="flex flex-col items-center text-center mb-8">
                        <Image src="https://raw.githubusercontent.com/Hassam990/synapse/refs/heads/main/Synapse.png" alt="SynapseGPT Logo" width={400} height={100} className="mb-4" />
                        <p className="text-lg md:text-xl text-foreground/80 mt-1">
                        Pakistan’s First GPT
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <Lightbulb className="h-4 w-4 text-primary" />
                        <span>Built with innovation. Designed for the future.</span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
                        <div className="bg-secondary/50 border border-border/30 rounded-lg p-6 text-center flex flex-col">
                            <h3 className="text-lg font-semibold text-foreground">A Message from the Creator</h3>
                            <p className="text-muted-foreground mt-2">
                            There are no upgrades for Synapse. If you want to support my work and help me grow, please consider donating to the people of Palestine.
                            </p>
                            <p className="font-urdu text-2xl font-bold text-primary mt-4">
                            سمجھو آپ کا ہر روپیہ اہم ہے
                            </p>
                            
                            <div className="text-left mt-4 bg-background/50 rounded-md p-4 text-sm space-y-2">
                            <p><span className="font-semibold text-foreground/90">Account Title:</span> <span className="text-muted-foreground">Al Khidmat Foundation Pakistan</span></p>
                            <p><span className="font-semibold text-foreground/90">Bank Name:</span> <span className="text-muted-foreground">Meezan Bank</span></p>
                            <p><span className="font-semibold text-foreground/90">IBAN:</span> <span className="text-muted-foreground">PK35MEZN0002140100861151</span></p>
                            <p><span className="font-semibold text-foreground/90">Swift Code:</span> <span className="text-muted-foreground">MEZNPKKA</span></p>
                            </div>

                            <Button onClick={handleCopyIBAN} className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
                            DONATE NOW (Copy IBAN)
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {suggestionCards.map((card, index) => (
                            <Link href={`/chat?prompt=${encodeURIComponent(card.prompt)}`} key={index} className="bg-secondary/50 border border-border/30 rounded-lg p-4 hover:bg-secondary transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 cursor-pointer text-left h-full flex flex-col">
                                <div className="flex items-center gap-3 mb-2">
                                    <card.icon className="h-6 w-6 text-primary" />
                                    <h3 className="font-semibold text-foreground">{card.title}</h3>
                                </div>
                                <p className="text-sm text-muted-foreground flex-grow">{card.description}</p>
                            </Link>
                            ))}
                        </div>
                    </div>
                </main>
                <footer className="p-4 w-full flex justify-center border-t border-border/20 flex-shrink-0">
                    <form onSubmit={handlePromptSubmit} className="relative w-full max-w-4xl mx-auto">
                        <Input
                        name="prompt"
                        placeholder="Write a business proposal for a tech startup in Karachi"
                        className="w-full bg-secondary pr-12 h-12 rounded-full"
                        />
                        <Button type="submit" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
                        <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </footer>
            </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
