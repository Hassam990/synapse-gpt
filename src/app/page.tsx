import Link from 'next/link';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  BrainCircuit,
  Plus,
  Settings,
  Bot,
  GraduationCap,
  Briefcase,
  PenSquare,
  Lightbulb,
  Send,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { redirect } from 'next/navigation';

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

export default function Home() {
  async function handlePromptSubmit(formData: FormData) {
    'use server';
    const prompt = formData.get('prompt') as string;
    if (prompt) {
      redirect(`/chat?prompt=${encodeURIComponent(prompt)}`);
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar collapsible="icon" className="border-r border-border/20">
          <SidebarHeader>
            <div className="flex items-center gap-2 pl-2">
              <div className="bg-foreground p-1.5 rounded-lg">
                <BrainCircuit className="h-6 w-6 text-background" />
              </div>
              <div className="flex flex-col">
                <h2 className="font-headline text-lg font-bold text-primary">SYNAPSE</h2>
                <p className="text-xs text-muted-foreground -mt-1">
                  Pakistan's First GPT
                </p>
              </div>
            </div>
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
          <div className="flex flex-col h-full">
            <header className="p-4 flex justify-end md:hidden">
                <SidebarTrigger />
            </header>
            <main className="flex-grow flex flex-col items-center justify-center p-4">
              <div className="flex flex-col items-center text-center">
                <div className="bg-secondary p-3 rounded-lg mb-4">
                  <BrainCircuit className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">
                  SYNAPSE
                </h1>
                <p className="text-lg md:text-xl text-foreground/80 mt-1">
                  Pakistan’s First GPT
                </p>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <span>Built with innovation. Designed for the future.</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 md:mt-12 w-full max-w-4xl">
                {suggestionCards.map((card, index) => (
                   <Link href={`/chat?prompt=${encodeURIComponent(card.prompt)}`} key={index} className="bg-secondary/50 border border-border/30 rounded-lg p-4 hover:bg-secondary transition-colors cursor-pointer text-left h-full flex flex-col">
                      <div className="flex items-center gap-3 mb-2">
                        <card.icon className="h-6 w-6 text-primary" />
                        <h3 className="font-semibold text-foreground">{card.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground flex-grow">{card.description}</p>
                  </Link>
                ))}
              </div>
            </main>
            <footer className="p-4 w-full max-w-4xl mx-auto">
               <form action={handlePromptSubmit} className="relative">
                <Input
                  name="prompt"
                  placeholder="Write a business proposal for a tech startup in Karachi"
                  className="w-full bg-secondary pr-12 h-12 rounded-full"
                />
                <Button type="submit" size="icon" className="absolute right-1.5 top-1.5 h-9 w-9 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
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
