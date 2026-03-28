
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
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileCode, 
  Files, 
  ChevronRight, 
  ChevronDown, 
  X, 
  Maximize2, 
  Minimize2, 
  Terminal as TerminalIcon,
  Settings,
  Search,
  FolderTree,
  FileJson,
  FileText,
  Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VirtualFile {
    id: string;
    name: string;
    language: string;
    content: string;
    isOpen: boolean;
}

const DEFAULT_FILES: VirtualFile[] = [
    { id: '1', name: 'main.py', language: 'python', content: 'name = input("What is your name? ")\nprint(f"Hello, {name}!")', isOpen: true },
    { id: '2', name: 'utils.js', language: 'javascript', content: 'console.log("Helper functions here...");', isOpen: false },
    { id: '3', name: 'README.md', language: 'markdown', content: '# Welcome to Synapse IDE\nStart building something amazing!', isOpen: false },
];

function CodeBuilderInterface() {
    const [files, setFiles] = useState<VirtualFile[]>(DEFAULT_FILES);
    const [activeFileId, setActiveFileId] = useState<string>('1');
    const [output, setOutput] = useState('');
    const [stdin, setStdin] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isTerminalExpanded, setIsTerminalExpanded] = useState(false);
    const [showExplorer, setShowExplorer] = useState(true);
    const { toast } = useToast();

    const activeFile = files.find(f => f.id === activeFileId) || files[0];

    const handleRunCode = async () => {
        if (!activeFile.content.trim()) {
            toast({ variant: 'destructive', title: 'No code to run' });
            return;
        }
        setIsLoading(true);
        setOutput('');
        try {
            // Ensure stdin has at least a newline if empty to avoid some EOF cases, 
            // though the backend should handle it.
            const result = await executeCode(activeFile.content, activeFile.language, stdin || "\n");
            if (result.success && typeof result.response === 'string') {
                setOutput(result.response);
                setIsTerminalExpanded(true);
            } else {
                throw new Error(result.error || 'Execution failed.');
            }
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            setOutput(`Error: ${msg}\n\nTip: If your code uses input(), make sure to provide values in the 'Standard Input' area below.`);
            setIsTerminalExpanded(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateCode = async () => {
        if (!aiPrompt.trim()) return;
        setIsGenerating(true);
        try {
            const result = await generateCode(aiPrompt, activeFile.language);
            if (result.success && result.response) {
                const { code: generatedCode } = result.response;
                setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: generatedCode } : f));
                toast({ title: 'Code Injected', description: `Injected into ${activeFile.name}` });
            }
        } finally {
            setIsGenerating(false);
        }
    };

    const toggleFile = (id: string) => {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, isOpen: true } : f));
        setActiveFileId(id);
    };

    const closeFile = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setFiles(prev => {
            const newFiles = prev.map(f => f.id === id ? { ...f, isOpen: false } : f);
            if (activeFileId === id) {
                const stillOpen = newFiles.find(f => f.isOpen);
                if (stillOpen) setActiveFileId(stillOpen.id);
            }
            return newFiles;
        });
    };

    const addFile = () => {
        const name = prompt('File name?');
        if (name) {
            const newFile = { id: Math.random().toString(), name, language: name.split('.').pop() || 'text', content: '', isOpen: true };
            setFiles(prev => [...prev, newFile]);
            setActiveFileId(newFile.id);
        }
    };

    return (
        <div className="flex-1 flex overflow-hidden">
            {/* Secondary Sidebar (Explorer) */}
            <AnimatePresence initial={false}>
                {showExplorer && (
                    <motion.div 
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 260, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="h-full border-r border-white/5 flex flex-col bg-[#080808] shrink-0"
                    >
                        <div className="h-10 flex items-center justify-between px-4 border-b border-white/5 whitespace-nowrap overflow-hidden">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#666] flex items-center gap-2">
                                Explorer
                            </span>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-white/5" onClick={addFile}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <ScrollArea className="flex-1 custom-scrollbar">
                            <div className="p-2 space-y-0.5">
                                {files.map(file => (
                                    <button
                                        key={file.id}
                                        onClick={() => toggleFile(file.id)}
                                        className={cn(
                                            "w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-all group",
                                            activeFileId === file.id ? "bg-[#1a1a1a] text-primary" : "text-[#888] hover:bg-[#121212] hover:text-[#ccc]"
                                        )}
                                    >
                                        <div className="flex-shrink-0">
                                            {file.name.endsWith('.py') ? <FileCode className="h-4 w-4 text-blue-400" /> : 
                                             file.name.endsWith('.js') ? <FileCode className="h-4 w-4 text-yellow-400" /> :
                                             <FileText className="h-4 w-4" />}
                                        </div>
                                        <span className="truncate flex-1 text-left">{file.name}</span>
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Editor Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#0c0c0c] relative">
                {/* Tabs Panel */}
                <div className="h-10 border-b border-white/5 flex items-center bg-[#080808] overflow-x-auto no-scrollbar shrink-0">
                    <AnimatePresence mode="popLayout" initial={false}>
                        {files.filter(f => f.isOpen).map(file => (
                            <motion.div
                                key={file.id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setActiveFileId(file.id)}
                                className={cn(
                                    "h-full flex items-center gap-2 px-4 cursor-pointer border-r border-white/5 text-[12px] transition-all min-w-[120px] max-w-[200px] relative group",
                                    activeFileId === file.id ? "bg-[#0c0c0c] text-white" : "bg-[#080808] text-[#777] hover:bg-[#0c0c0c] hover:text-[#ccc]"
                                )}
                            >
                                <span className={cn("truncate flex-1 transition-colors", activeFileId === file.id ? "font-bold" : "font-normal")}>{file.name}</span>
                                <div className="p-0.5 hover:bg-white/10 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => closeFile(e, file.id)}>
                                    <X className="h-3 w-3" />
                                </div>
                                {activeFileId === file.id && <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary" />}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Toolbar */}
                <div className="h-10 flex items-center justify-between px-4 border-b border-white/5 bg-[#0a0a0a]">
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold text-[#555] uppercase bg-[#1a1a1a] px-2 py-0.5 rounded leading-none">
                            {activeFile.language}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            size="sm" 
                            variant="default" 
                            onClick={handleRunCode} 
                            disabled={isLoading}
                            className="bg-[#1e1e1e] hover:bg-[#2a2a2a] text-green-400 h-7 px-3 text-[11px] font-bold border border-white/5 rounded-md"
                        >
                            <Play className="h-3 w-3 mr-1.5 fill-green-400" /> {isLoading ? 'RUNNING...' : 'RUN'}
                        </Button>
                    </div>
                </div>

                {/* Main Viewport */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Editor Component */}
                    <div className="flex-1 relative bg-[#0c0c0c]">
                        <textarea
                            value={activeFile.content}
                            onChange={(e) => {
                                const newContent = e.target.value;
                                setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: newContent } : f));
                            }}
                            className="w-full h-full bg-transparent resize-none p-4 font-mono text-[14px] outline-none text-[#ccc] leading-[1.6] selection:bg-primary/20"
                            placeholder="Write your code here..."
                            spellCheck={false}
                        />

                        {/* Collapsible Panel (Integrated) */}
                        <AnimatePresence>
                             <motion.div 
                                animate={{ height: isTerminalExpanded ? 260 : 28 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                                className="absolute bottom-0 left-0 right-0 bg-[#080808] border-t border-white/5 z-20 flex flex-col overflow-hidden"
                            >
                                <div className="h-7 border-b border-white/5 flex items-center justify-between px-4 cursor-pointer hover:bg-white/2" onClick={() => setIsTerminalExpanded(!isTerminalExpanded)}>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black uppercase text-[#666] flex items-center gap-1.5">
                                            <TerminalIcon className="h-3 w-3" /> Output
                                        </span>
                                        {output && <span className="text-[10px] text-green-500/80 font-bold">• Running</span>}
                                    </div>
                                    <div className="flex items-center gap-2 text-[#666]">
                                        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-300", isTerminalExpanded ? "" : "rotate-180")} />
                                    </div>
                                </div>
                                {isTerminalExpanded && (
                                    <div className="flex-1 flex flex-col md:flex-row min-h-0 bg-[#050505]">
                                        <div className="flex-1 p-4 font-mono text-[12px] text-green-400 overflow-auto custom-scrollbar">
                                            <pre className="whitespace-pre-wrap">{output || '// Execution output...'}</pre>
                                        </div>
                                        <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-white/5 flex flex-col bg-[#080808]">
                                            <div className="h-7 border-b border-white/5 flex items-center px-4">
                                                <span className="text-[9px] font-black text-[#666] uppercase">stdin</span>
                                            </div>
                                            <textarea 
                                                value={stdin}
                                                onChange={(e) => setStdin(e.target.value)}
                                                className="flex-1 bg-transparent p-3 text-[12px] font-mono outline-none text-[#999] resize-none"
                                                placeholder="Paste input here..."
                                            />
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Copilot Pane (Pinned Right like Trae/VSCode) */}
                    <div className="w-[340px] border-l border-white/5 flex flex-col bg-[#0a0a0a] shrink-0">
                         <div className="h-10 p-4 border-b border-white/5 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2 text-[11px] font-bold text-white uppercase tracking-wider">
                                <Sparkles className="h-4 w-4 text-primary" /> Copilot
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                <Minus className="h-4 w-4" />
                            </Button>
                         </div>
                         <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto custom-scrollbar">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#555] uppercase">Your Instruction</label>
                                <textarea 
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    placeholder="Describe what you want to build..."
                                    className="w-full bg-[#151515] border border-white/5 rounded-lg p-3 text-[13px] h-32 focus:border-primary/50 outline-none transition-all text-[#ccc] resize-none"
                                />
                            </div>
                            <Button onClick={handleGenerateCode} disabled={isGenerating} className="w-full bg-primary text-black font-black text-[11px] h-10 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)] shrink-0">
                                {isGenerating ? 'GENERATING...' : 'GENERATE & INJECT'}
                            </Button>
                            
                            <div className="mt-auto p-3 rounded-lg border border-white/5 bg-[#121212]/50 text-[11px] text-[#777] leading-relaxed italic">
                                Tip: You can ask the AI to refactor, debug, or add new features directly to the open file.
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CodeBuilderPage() {
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const firestore = useFirestore();
    
    const [showExplorer, setShowExplorer] = useState(true);

    const handleLogout = () => {
      if (auth) {
        signOut(auth);
      }
    }

    return (
        <div className="flex h-screen w-screen bg-[#050505] text-foreground overflow-hidden font-sans selection:bg-primary/30">
            <style jsx global>{`
                body { overflow: hidden !important; background: #050505 !important; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #444; }
            `}</style>
            
            {/* Trae-style Activity Bar (Slim Left) */}
            <div className="w-[50px] bg-[#0a0a0a] border-r border-white/5 flex flex-col items-center py-4 gap-4 shrink-0 z-50">
                <Link href="/" className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center mb-4 transition-transform hover:scale-105 active:scale-95 cursor-pointer" title="Go Home">
                    <Sparkles className="h-5 w-5 text-primary" />
                </Link>
                <div 
                    className={cn("p-2 cursor-pointer transition-colors rounded-lg", showExplorer ? "text-primary bg-primary/5" : "text-[#555] hover:text-[#aaa]")} 
                    onClick={() => setShowExplorer(!showExplorer)}
                    title="Explorer"
                >
                    <Files className="h-6 w-6" />
                </div>
                <div className="p-2 text-[#444] hover:text-[#aaa] cursor-pointer transition-colors" title="Search">
                    <Search className="h-6 w-6" />
                </div>
                <div className="p-2 text-[#444] hover:text-[#aaa] cursor-pointer transition-colors" title="Source Control">
                    <Code className="h-6 w-6" />
                </div>
                
                <div className="mt-auto flex flex-col items-center gap-4">
                    <div className="p-2 text-[#444] hover:text-[#aaa] cursor-pointer transition-colors" title="Settings">
                         <Settings className="h-6 w-6" />
                    </div>
                    {user ? (
                         <div className="p-2 text-[#444] hover:text-red-400 cursor-pointer transition-colors" onClick={handleLogout} title="Logout">
                            <LogOut className="h-6 w-6" />
                         </div>
                    ) : (
                        <Link href="/chat" className="p-2 text-[#444] hover:text-primary cursor-pointer transition-colors" title="Back to Chat">
                            <LogIn className="h-6 w-6 rotate-180" />
                        </Link>
                    )}
                </div>
            </div>

            {/* Main IDE Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Independent Header */}
                <header className="h-10 bg-[#0a0a0a] border-b border-white/5 flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-4 text-[10px] font-bold text-[#555] uppercase tracking-[0.2em]">
                        <Link href="/chat" className="text-white font-black hover:text-primary transition-colors flex items-center gap-2">
                             Synapse IDE
                        </Link>
                        <div className="h-3 w-[1px] bg-white/10" />
                        <div className="flex items-center gap-1.5 overflow-hidden">
                            <span className="flex items-center gap-1 opacity-60"><FolderTree className="h-3 w-3" /> project</span>
                            <ChevronRight className="h-3 w-3 opacity-30" />
                            <span className="text-primary truncate font-black">main.py</span>
                        </div>
                    </div>
                </header>

                {/* 3-Pane Content */}
                <div className="flex-1 flex min-h-0 bg-[#0c0c0c]">
                    <CodeBuilderInterface />
                </div>

                {/* Bottom Status Bar */}
                <footer className="h-6 bg-primary flex items-center justify-between px-3 text-[10px] text-black font-black shrink-0 pointer-events-none select-none">
                    <div className="flex items-center gap-4">
                         <span className="flex items-center gap-1.5"><Code className="h-3.5 w-3.5" /> MAIN*</span>
                         <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> AI READY</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="opacity-80">LN 1, COL 1</span>
                        <span className="opacity-80">UTF-8</span>
                        <span className="opacity-80">PYTHON 3.10</span>
                    </div>
                </footer>
            </div>
        </div>
    );
}

