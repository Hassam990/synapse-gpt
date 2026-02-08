
'use client';

import { useState } from 'react';
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
  Code,
  LogIn,
  LogOut,
  Play,
  Plus,
  Sparkles,
  User,
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser, useAuth, useFirestore } from '@/firebase';
import { signInAsGuest } from '@/firebase/non-blocking-login';
import { signOut } from 'firebase/auth';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { executeCode, generateCode } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { signInWithGoogle } from '@/firebase/auth-actions';
import RecentChats from '@/components/recent-chats';
import { Suspense } from 'react';


function CodeBuilderInterface() {
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('python');
    const [output, setOutput] = useState('');
    const [stdin, setStdin] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();

    const handleRunCode = async () => {
        if (!code.trim()) {
            toast({
                variant: 'destructive',
                title: 'No code to run',
                description: 'Please write some code in the editor before running.',
            });
            return;
        }
        setIsLoading(true);
        setOutput('');
        try {
            const result = await executeCode(code, language, stdin);
            if (result.success && typeof result.response === 'string') {
                setOutput(result.response);
            } else {
                throw new Error(result.error || 'Failed to execute code.');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            setOutput(`Error: ${errorMessage}`);
            toast({
                variant: "destructive",
                title: "Error executing code",
                description: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateCode = async () => {
        if (!aiPrompt.trim()) {
            toast({
                variant: 'destructive',
                title: 'Prompt is empty',
                description: 'Please describe the code you want to generate.',
            });
            return;
        }
        setIsGenerating(true);
        setCode('');
        setStdin('');
        try {
            const result = await generateCode(aiPrompt, language);
            if (result.success && result.response) {
                const { code: generatedCode, stdin: generatedStdin } = result.response;
                setCode(generatedCode);
                setStdin(generatedStdin);
                toast({
                    title: 'Code Generated',
                    description: 'The AI has generated the code and sample input for you.',
                });
            } else {
                throw new Error(result.error || 'Failed to generate code.');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            toast({
                variant: "destructive",
                title: "Error generating code",
                description: errorMessage,
            });
        } finally {
            setIsGenerating(false);
        }
    };


    const placeholderCode: { [key: string]: string } = {
        python: 'name = input("What is your name? ")\nprint(f"Hello, {name}!")',
        javascript: 'console.log("Hello from JavaScript!");',
        cpp: '#include <iostream>\n#include <string>\n\nint main() {\n    std::string name;\n    std::cout << "What is your name? ";\n    std::getline(std::cin, name);\n    std::cout << "Hello, " << name << "!" << std::endl;\n    return 0;\n}',
        c: '#include <stdio.h>\n\nint main() {\n   char name[50];\n   printf("What is your name? ");\n   fgets(name, sizeof(name), stdin);\n   printf("Hello, %s", name);\n   return 0;\n}',
    }

    return (
        <div className="flex flex-col h-full w-full gap-4">
            <header className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-b border-border/20 rounded-lg bg-card">
                 <h1 className="text-xl font-bold shrink-0">Synapse Code Builder</h1>
                 <div className="flex w-full sm:w-auto items-center gap-4">
                     <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="w-full sm:w-[180px] bg-secondary">
                            <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="javascript">JavaScript</SelectItem>
                            <SelectItem value="cpp">C++</SelectItem>
                            <SelectItem value="c">C</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>
            </header>
            
            <div className="flex flex-col gap-3 p-4 border border-border/30 rounded-lg bg-secondary/30">
                <h2 className="text-lg font-semibold flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary"/>AI Code Generator</h2>
                <Textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder={`Describe what you want to build in ${language}... e.g., "A function that returns the nth fibonacci number"`}
                    className="font-mono bg-card border-border/20 text-base"
                    rows={3}
                />
                <Button onClick={handleGenerateCode} disabled={isGenerating} className="w-full sm:w-auto self-end">
                    {isGenerating ? 'Generating...' : 'Generate Code'}
                </Button>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 flex-grow min-h-0">
                <div className="flex flex-col gap-2 h-1/2 lg:h-full lg:w-2/3">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold">Code Editor</h2>
                        <Button onClick={handleRunCode} disabled={isLoading}>
                            <Play className="mr-2 h-4 w-4" />
                            {isLoading ? 'Running...' : 'Run'}
                        </Button>
                    </div>
                    <div className="flex-grow min-h-0">
                      <Textarea 
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          placeholder={placeholderCode[language] || 'Write your code here...'}
                          className="w-full h-full resize-none font-mono bg-card border-border/20 text-base"
                      />
                    </div>
                </div>
                <div className="flex flex-col gap-4 h-1/2 lg:h-full lg:w-1/3">
                    <div className="flex flex-col gap-2 flex-grow min-h-0">
                        <h2 className="text-lg font-semibold">Output Terminal</h2>
                        <div className="flex-grow bg-black rounded-lg p-4 font-mono text-white text-sm overflow-auto">
                            <pre>{isLoading ? 'Executing code...' : output || '// Output will be shown here'}</pre>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                        <h2 className="text-lg font-semibold">Standard Input (stdin)</h2>
                        <Textarea
                            value={stdin}
                            onChange={(e) => setStdin(e.target.value)}
                            placeholder="Provide input for your program here, one line per input."
                            className="font-mono bg-card border-border/20 text-base"
                            rows={3}
                        />
                    </div>
                </div>
            </div>
        </div>
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


export default function CodeBuilderPage() {
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const firestore = useFirestore();
    
    const handleGoogleLogin = () => {
      if (auth && firestore) {
        signInWithGoogle(auth, firestore);
      }
    };
  
    const handleGuestLogin = () => {
      if(auth) {
        signInAsGuest(auth);
      }
    };
  
    const handleLogout = () => {
      if (auth) {
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
                        <SidebarMenuButton className="w-full justify-start" isActive={true}>
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
              <main className="flex-grow flex flex-col overflow-hidden p-4">
                <CodeBuilderInterface />
              </main>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
}
