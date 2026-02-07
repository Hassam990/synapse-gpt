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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Code,
  LogIn,
  LogOut,
  Play,
  Plus,
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
import { useUser, useAuth } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { signOut } from 'firebase/auth';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { executeCode } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

function CodeBuilderInterface() {
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('python');
    const [output, setOutput] = useState('');
    const [stdin, setStdin] = useState('');
    const [isLoading, setIsLoading] = useState(false);
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
            if (result.success && result.response) {
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

    const placeholderCode: { [key: string]: string } = {
        python: 'name = input("What is your name? ")\nprint(f"Hello, {name}!")',
        javascript: 'console.log("Hello from JavaScript!");',
        cpp: '#include <iostream>\n#include <string>\n\nint main() {\n    std::string name;\n    std::cout << "What is your name? ";\n    std::getline(std::cin, name);\n    std::cout << "Hello, " << name << "!" << std::endl;\n    return 0;\n}',
        c: '#include <stdio.h>\n\nint main() {\n   char name[50];\n   printf("What is your name? ");\n   fgets(name, sizeof(name), stdin);\n   printf("Hello, %s", name);\n   return 0;\n}',
    }

    return (
        <div className="flex flex-col h-full w-full gap-4">
            <header className="flex items-center justify-between p-4 border-b border-border/20 rounded-lg bg-card">
                 <h1 className="text-xl font-bold">Synapse Code Builder</h1>
                 <div className="flex items-center gap-4">
                     <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="w-[180px] bg-secondary">
                            <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="javascript">JavaScript</SelectItem>
                            <SelectItem value="cpp">C++</SelectItem>
                            <SelectItem value="c">C</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={handleRunCode} disabled={isLoading}>
                        <Play className="mr-2 h-4 w-4" />
                        {isLoading ? 'Running...' : 'Run'}
                    </Button>
                 </div>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-semibold">Code Editor</h2>
                    <Textarea 
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder={placeholderCode[language] || 'Write your code here...'}
                        className="flex-grow font-mono bg-card border-border/20 text-base"
                        rows={20}
                    />
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2 flex-grow">
                        <h2 className="text-lg font-semibold">Output Terminal</h2>
                        <div className="flex-grow bg-black rounded-lg p-4 font-mono text-white text-sm overflow-auto">
                            <pre>{isLoading ? 'Executing code...' : output || '// Output will be shown here'}</pre>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <h2 className="text-lg font-semibold">Standard Input (stdin)</h2>
                        <Textarea
                            value={stdin}
                            onChange={(e) => setStdin(e.target.value)}
                            placeholder="Provide input for your program here, one line per input."
                            className="font-mono bg-card border-border/20 text-base"
                            rows={5}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}


export default function CodeBuilderPage() {
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
              <main className="flex-grow flex flex-col overflow-hidden p-4">
                <CodeBuilderInterface />
              </main>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
}
