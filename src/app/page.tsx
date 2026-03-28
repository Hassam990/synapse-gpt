
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
import { SlidingNumber } from '@/components/animate-ui/primitives/texts/sliding-number';
import { motion } from 'framer-motion';

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
      <div className="flex min-h-screen w-full bg-[#050505] text-white relative overflow-hidden mesh-gradient">
        {/* Animated background elements for glass effect depth */}
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-primary/20 rounded-full blur-[160px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-primary/10 rounded-full blur-[160px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />
        
        <Sidebar collapsible="icon" className="glass border-r border-white/10 z-50">
          <SidebarHeader className="border-b border-white/5 py-4">
            <Link href="/" className="flex items-center gap-2 px-2">
              <Image src="https://raw.githubusercontent.com/Hassam990/synapse/refs/heads/main/Synapse.png" alt="SynapseGPT Logo" width={160} height={40} />
            </Link>
          </SidebarHeader>
          <SidebarContent className="p-2">
             <SidebarMenu>
                 <SidebarMenuItem>
                    <Link href="/chat" className="w-full">
                        <motion.div whileHover={{ x: 5 }}>
                          <SidebarMenuButton className="w-full justify-start hover:bg-white/5">
                          <Plus className="mr-2 h-4 w-4" />
                          New Chat
                          </SidebarMenuButton>
                        </motion.div>
                    </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <Link href="/code-builder" className="w-full">
                        <motion.div whileHover={{ x: 5 }}>
                          <SidebarMenuButton className="w-full justify-start hover:bg-white/5">
                          <Code className="mr-2 h-4 w-4" />
                          Code Builder
                          </SidebarMenuButton>
                        </motion.div>
                    </Link>
                </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t border-white/5">
             <div className="flex items-center justify-between p-2">
              {isUserLoading ? (
                 <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-9 rounded-full bg-white/5" />
                    <div className="flex flex-col gap-1">
                      <Skeleton className="h-4 w-20 bg-white/5" />
                      <Skeleton className="h-3 w-16 bg-white/5" />
                    </div>
                  </div>
              ) : user ? (
                <div className="flex items-center gap-2 w-full">
                  <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                     {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />}
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                       {user.displayName ? user.displayName.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col flex-grow min-w-0">
                    <p className="text-sm font-semibold truncate text-foreground">{user.displayName || 'Anonymous User'}</p>
                    <p className="text-xs text-muted-foreground">{user.isAnonymous ? "Guest" : "Member"}</p>
                  </div>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Sign Out" className="hover:text-destructive hover:bg-destructive/10">
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>
              ) : (
                  <div className="w-full space-y-2">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button onClick={handleGoogleLogin} className="w-full glass border-white/10 hover:bg-white/5 text-foreground justify-start text-xs sm:text-sm">
                        <GoogleIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="truncate">Sign In with Google</span>
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button variant="secondary" onClick={handleGuestLogin} className="w-full glass border-white/10 hover:bg-white/5 text-foreground justify-start text-xs sm:text-sm">
                        <User className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="truncate">Continue as Guest</span>
                      </Button>
                    </motion.div>
                  </div>
              )}
            </div>
          </SidebarFooter>
        </Sidebar>
        
        <SidebarInset className="bg-transparent flex-1 w-full min-w-0 overflow-hidden relative">
            <div className="flex flex-col h-full w-full min-w-0">
                <header className="p-4 flex justify-end md:hidden flex-shrink-0 absolute top-0 right-0 z-50">
                    <SidebarTrigger />
                </header>
                <main className="flex-1 w-full overflow-y-auto p-4 md:p-8">
                    <motion.div 
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="flex flex-col items-center text-center mb-12"
                    >
                        <Image src="https://raw.githubusercontent.com/Hassam990/synapse/refs/heads/main/Synapse.png" alt="SynapseGPT Logo" width={400} height={100} className="mb-6 drop-shadow-2xl" />
                        <div className="flex items-center justify-center gap-2 text-xl md:text-2xl text-foreground font-semibold tracking-tight">
                            <span>Pakistan’s</span>
                            <SlidingNumber number={1} className="text-primary" />
                            <span>st GPT</span>
                        </div>
                        <motion.div 
                          className="flex items-center gap-2 mt-4 text-primary font-medium px-4 py-1 rounded-full glass border-primary/20"
                          animate={{ opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Lightbulb className="h-4 w-4" />
                          <span className="text-sm">Built with innovation. Designed for the future.</span>
                        </motion.div>
                    </motion.div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl mx-auto">
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                          className="glass-panel p-8 rounded-3xl text-center flex flex-col items-center justify-center space-y-4 border-white/10"
                        >
                            <h3 className="text-2xl font-bold text-foreground">A Message from the Creator</h3>
                            <p className="text-muted-foreground leading-relaxed">
                            There are no upgrades for Synapse. If you want to support my work and help me grow, please consider donating to the people of Palestine.
                            </p>
                            <div className="p-4 bg-primary/5 rounded-2xl w-full border border-primary/10">
                              <p className="font-urdu text-3xl font-bold text-primary">
                              سمجھو آپ کا ہر روپیہ اہم ہے
                              </p>
                            </div>
                            
                            <div className="text-left w-full glass rounded-2xl p-6 text-sm space-y-3 border-white/5">
                              <p className="flex justify-between"><span className="font-semibold text-muted-foreground">Account Title:</span> <span className="text-foreground text-right">Al Khidmat Foundation Pakistan</span></p>
                              <p className="flex justify-between"><span className="font-semibold text-muted-foreground">Bank Name:</span> <span className="text-foreground">Meezan Bank</span></p>
                              <p className="flex justify-between items-center gap-2"><span className="font-semibold text-muted-foreground shrink-0">IBAN:</span> <span className="text-primary font-mono truncate">PK35MEZN0002140100861151</span></p>
                              <p className="flex justify-between"><span className="font-semibold text-muted-foreground">Swift Code:</span> <span className="text-foreground">MEZNPKKA</span></p>
                            </div>

                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full">
                              <Button onClick={handleCopyIBAN} className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                                DONATE NOW (Copy IBAN)
                              </Button>
                            </motion.div>
                        </motion.div>

                        <motion.div 
                          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                          initial="hidden"
                          animate="show"
                          variants={{
                            hidden: { opacity: 0 },
                            show: {
                              opacity: 1,
                              transition: { staggerChildren: 0.1, delayChildren: 0.3 }
                            }
                          }}
                        >
                            {suggestionCards.map((card, index) => (
                            <motion.div key={index} variants={{ hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } }} className="h-full">
                              <Link href={`/chat?prompt=${encodeURIComponent(card.prompt)}`} className="glass-panel p-6 rounded-3xl hover:bg-white/5 transition-all duration-300 border-white/5 cursor-pointer text-left h-full flex flex-col group">
                                  <div className="flex items-center gap-4 mb-3">
                                      <div className="p-3 rounded-2xl bg-primary/10 group-hover:bg-primary text-primary group-hover:text-primary-foreground transition-all">
                                        <card.icon className="h-6 w-6" />
                                      </div>
                                      <h3 className="font-bold text-lg text-foreground tracking-tight">{card.title}</h3>
                                  </div>
                                  <p className="text-sm text-muted-foreground flex-grow leading-relaxed">{card.description}</p>
                              </Link>
                            </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </main>
                <motion.footer 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="p-6 w-full flex justify-center flex-shrink-0"
                >
                    <form onSubmit={handlePromptSubmit} className="relative w-full max-w-4xl mx-auto group">
                        <Input
                          name="prompt"
                          placeholder="Write a business proposal for a tech startup in Karachi"
                          className="w-full glass bg-black/10 backdrop-blur-xl border-white/10 h-16 rounded-3xl focus-visible:ring-primary focus-visible:ring-offset-0 px-8 text-lg shadow-2xl"
                        />
                        <motion.div 
                          whileHover={{ scale: 1.1 }} 
                          whileTap={{ scale: 0.9 }}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          <Button type="submit" size="icon" className="h-10 w-12 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
                            <Send className="h-5 w-5" />
                          </Button>
                        </motion.div>
                    </form>
                </motion.footer>
            </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
