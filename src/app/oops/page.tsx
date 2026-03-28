'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
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
  Minus,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  Trophy,
  MessageCircle,
  Languages
} from 'lucide-react';
import { generateStudyGuide } from '@/app/actions';
import { OOPS_COURSE, type StudySlide } from './oops-data';
import { cn } from '@/lib/utils';

interface VirtualFile {
    id: string;
    name: string;
    language: string;
    content: string;
    isOpen: boolean;
}

const DEFAULT_FILES: VirtualFile[] = [
    { 
        id: 'oops-prep', 
        name: 'OOPS_PAPER_PREP.md', 
        language: 'markdown',
        isOpen: true,
        content: `# 📘 OOPS Paper Preparation Guide (Slides 1-8)

Welcome classmates! This guide is created to ensure **no one gets failed** and everyone studies better for our OOPS paper.

---

## 🛠️ Part 1: Detail-by-Detail Explanations

### 1. Python Lists (Week 2B)
- **What is it?** An ordered, mutable collection. Imagine a row of boxes where you can change what is inside.
- **Key Features:**
  - **Ordered:** Items have fixed positions (indices).
  - **Mutable:** You can change values after creating it.
  - **Dynamic:** Can grow (append) or shrink (pop).
- **Common Methods:** \`append()\`, \`pop()\`, \`sort()\`, \`reverse()\`.
- **Pro Tip:** Use \`fruits[-1]\` to get the last item instantly!

### 2. Loops & Control (Week 2A)
- **For Loop:** Used to go through every item in a list or string.
- **While Loop:** Runs as long as a condition is true.
- **range(start, stop, step):** Generates numbers. *Remember: It stops one before the 'stop' value!*
- **Example:** \`for i in range(1, 6):\` runs 1, 2, 3, 4, 5.

### 3. Dictionaries & Sets
- **Dictionaries:** Key-Value pairs. Like a real dictionary: "Word" (Key) -> "Meaning" (Value). Keys must be unique!
- **Sets:** Unordered collection of **unique** elements. No duplicates allowed. Great for clearing duplicates from a list: \`list(set(my_list))\`.

### 4. User-Defined Functions
- **Definition:** Reusable blocks of code. Use \`def\` to create them.
- **Parameters:** Data you pass INTO the function.
- **Return:** Data the function sends BACK to you.

### 5. Classes & Objects (OOP)
- **Class:** The blueprint (e.g., "Car" design).
- **Object:** The actual instance (e.g., your red Toyota).
- **State:** Attributes (color, model).
- **Behavior:** Methods (drive, brake).

### 6. Instance Modifiers (Security)
- **Public:** Access anywhere (\`var\`).
- **Protected:** One underscore (\`_var\`). Should stay in the family!
- **Private:** Two underscores (\`__var\`). Super secure, use "Name Mangling" (\`_Class__var\`) to access (not recommended).

### 7. Static Attributes & Methods
- **Static Attributes:** Shared by ALL objects of a class (e.g., \`company_name\`).
- **Static Methods:** Utility functions that don't need \`self\`. Use \`@staticmethod\`.

---

## 📝 Part 2: OOPS Practice Test (Mock Paper)

**Q1: What symbol is used to indicate a private variable in Python?**
A) _
B) __
C) #
D) *

**Q2: Which list method is used to add an item to the end of the list?**
A) insert()
B) push()
C) add()
D) append()

**Q3: What will be the output of \`range(2, 10, 2)\`?**
A) 2, 4, 6, 8, 10
B) 2, 4, 6, 8
C) 0, 2, 4, 6, 8
D) 2, 4, 6, 10

**Q4: A class is an instance of an object. (True/False)**
A) True
B) False

**Q5: Which modifier is used for "Name Mangling" in Python?**
A) Public
B) Protected
C) Private
D) Static

---

## 🔑 Answers (Check after trying!)
1. B (Private uses __)
2. D (append adds to the end)
3. B (Stops before 10)
4. B (Object is an instance of a Class!)
` 
    }
];

function CodeBuilderInterface({ 
    practiceSlideIdx, 
    onClosePractice,
    onNextSlide
}: { 
    practiceSlideIdx: number | null, 
    onClosePractice: () => void,
    onNextSlide: () => void
}) {
    const [files, setFiles] = useState<VirtualFile[]>(DEFAULT_FILES);
    const [activeFileId, setActiveFileId] = useState<string>(DEFAULT_FILES[0].id);
    const [output, setOutput] = useState('');
    const [stdin, setStdin] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTerminalExpanded, setIsTerminalExpanded] = useState(false);
    const [showExplorer, setShowExplorer] = useState(true);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);
    const [currentPracticeIdx, setCurrentPracticeIdx] = useState(0);
    const { toast } = useToast();

    const activeFile = files.find(f => f.id === activeFileId);
    const slide = practiceSlideIdx !== null ? OOPS_COURSE[practiceSlideIdx] : null;

    useEffect(() => {
        setCurrentPracticeIdx(0);
        setVerificationFeedback(null);
    }, [practiceSlideIdx]);

    useEffect(() => {
        if (practiceSlideIdx !== null && slide) {
            const currentPractice = slide.practice[currentPracticeIdx];
            const practiceFileId = `practice-${practiceSlideIdx}-${currentPracticeIdx}`;
            setFiles(prev => {
                const exists = prev.find(f => f.id === practiceFileId);
                if (exists) return prev.map(f => f.id === practiceFileId ? { ...f, content: currentPractice.initialCode, isOpen: true } : f);
                return [...prev, { 
                    id: practiceFileId, 
                    name: `slide_${practiceSlideIdx + 1}_${currentPractice.difficulty.toLowerCase()}.py`, 
                    language: 'python', 
                    content: currentPractice.initialCode, 
                    isOpen: true 
                }];
            });
            setActiveFileId(practiceFileId);
            setShowExplorer(true);
            setVerificationFeedback(null);
        }
    }, [practiceSlideIdx, slide, currentPracticeIdx]);

    const handleVerify = async () => {
        if (!slide || !activeFile) return;
        const currentPractice = slide.practice[currentPracticeIdx];
        setIsVerifying(true);
        setVerificationFeedback(null);
        
        const userCode = activeFile.content.replace(/\s/g, '');
        const solutionCode = currentPractice.solution.replace(/\s/g, '');
        
        setTimeout(() => {
            if (userCode.includes(solutionCode) || solutionCode.includes(userCode)) {
                setVerificationFeedback("CORRECT");
            } else {
                setVerificationFeedback("WRONG");
            }
            setIsVerifying(false);
        }, 1000);
    };

    const handleRunCode = async () => {
        if (!activeFile || !activeFile.content.trim()) {
            toast({ variant: 'destructive', title: 'No code to run' });
            return;
        }
        setIsLoading(true);
        setOutput('');
        try {
            const result = await executeCode(activeFile.content, activeFile.language, stdin || "\n");
            if (result.success && typeof result.response === 'string') {
                setOutput(result.response);
                setIsTerminalExpanded(true);
            } else {
                throw new Error(result.error || 'Execution failed.');
            }
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            setOutput('Error: ' + msg + '\n\nTip: You can use the standard output below.');
            setIsTerminalExpanded(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 flex overflow-hidden">
            {showExplorer && (
                <div className="w-60 h-full border-r border-white/5 flex flex-col bg-[#080808] shrink-0">
                    <div className="h-10 flex items-center px-4 border-b border-white/5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#666]">Explorer</span>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="p-2 space-y-0.5">
                            {files.map(file => (
                                <button
                                    key={file.id}
                                    onClick={() => setActiveFileId(file.id)}
                                    className={cn(
                                        "w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] transition-all",
                                        activeFileId === file.id ? "bg-[#1a1a1a] text-primary" : "text-[#888] hover:bg-[#121212]"
                                    )}
                                >
                                    <FileCode className="h-4 w-4" />
                                    <span className="truncate">{file.name}</span>
                                </button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            )}

            <div className="flex-1 flex flex-col min-w-0 relative">
                {activeFile ? (
                    <>
                        <div className="h-9 bg-[#080808] border-b border-white/5 flex items-center px-4 gap-2 overflow-x-auto no-scrollbar">
                            {files.filter(f => f.isOpen).map(file => (
                                <div 
                                    key={file.id}
                                    onClick={() => setActiveFileId(file.id)}
                                    className={cn(
                                        "flex items-center gap-2 px-3 h-full cursor-pointer border-t-2 transition-all",
                                        activeFileId === file.id ? "bg-[#0c0c0c] border-primary text-white" : "border-transparent text-[#555] hover:text-[#888]"
                                    )}
                                >
                                    <Code className="h-3 w-3" />
                                    <span className="text-[11px] font-bold whitespace-nowrap">{file.name}</span>
                                    <div 
                                        className="hover:text-white p-0.5 rounded"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFiles(files.map(f => f.id === file.id ? { ...f, isOpen: false } : f));
                                        }}
                                    >
                                        <X className="h-3 w-3" />
                                    </div>
                                </div>
                            ))}
                            <Button onClick={handleRunCode} disabled={isLoading} size="sm" className="ml-auto h-6 text-[10px] bg-green-500/10 text-green-400 hover:bg-green-500/20">
                                <Play className="h-3 w-3 mr-1" /> RUN
                            </Button>
                        </div>
                        <div className="flex-1 bg-[#0c0c0c] relative group">
                            <textarea 
                                value={activeFile.content}
                                onChange={(e) => setFiles(files.map(f => f.id === activeFileId ? { ...f, content: e.target.value } : f))}
                                className="w-full h-full bg-transparent p-6 font-mono text-[13px] text-[#ccc] leading-relaxed resize-none outline-none custom-scrollbar"
                                spellCheck={false}
                            />
                            
                            {slide && (
                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="absolute top-4 right-4 w-80 bg-[#111]/95 backdrop-blur-xl border border-primary/20 rounded-2xl p-6 shadow-2xl z-50 space-y-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <GraduationCap className="h-4 w-4 text-primary" />
                                            <span className="text-[10px] font-black text-white uppercase tracking-wider">Coach: {slide.practice[currentPracticeIdx].difficulty}</span>
                                        </div>
                                        <button onClick={onClosePractice} className="text-[#555] hover:text-white"><X className="h-4 w-4" /></button>
                                    </div>
                                    <p className="text-[11px] text-[#aaa] font-medium leading-relaxed italic">{slide.practice[currentPracticeIdx].description}</p>
                                    
                                    {verificationFeedback === "CORRECT" ? (
                                        <div className="space-y-4">
                                            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-[11px] font-black leading-relaxed">
                                                ✅ {currentPracticeIdx < slide.practice.length - 1 ? 'SHABASH! Level Complete. Ready for the next one?' : 'EXCELLENT! You mastered all levels of this slide.'}
                                            </div>
                                            {currentPracticeIdx < slide.practice.length - 1 ? (
                                                <Button onClick={() => { setCurrentPracticeIdx(p => p+1); setVerificationFeedback(null); }} className="w-full bg-primary text-black font-black py-4 rounded-xl text-[10px] uppercase tracking-widest">
                                                    NEXT LEVEL
                                                </Button>
                                            ) : (
                                                <Button onClick={onNextSlide} className="w-full bg-green-500 text-black font-black py-4 rounded-xl text-[10px] uppercase tracking-widest hover:bg-green-400">
                                                    GO TO NEXT SLIDE THEORY
                                                </Button>
                                            )}
                                        </div>
                                    ) : verificationFeedback === "WRONG" ? (
                                        <div className="space-y-4">
                                            {verificationFeedback === "WRONG" && slide.practice[currentPracticeIdx].conceptReminder && (
                                                <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-primary text-[10px] font-black uppercase tracking-widest mb-2 animate-pulse">
                                                    💡 CONCEPT REMINDER: {slide.practice[currentPracticeIdx].conceptReminder}
                                                </div>
                                            )}
                                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-medium leading-relaxed">
                                                <p className="font-black mb-2 uppercase tracking-tighter">❌ Try Again!</p>
                                                <p className="mb-3 text-[#aaa]">Check your logic against the solution below.</p>
                                                <div className="p-3 bg-black/40 rounded-lg border border-red-500/10 font-mono text-[10px] text-white">
                                                    <p className="text-[#666] mb-1">RIGHT CODE:</p>
                                                    <pre>{slide.practice[currentPracticeIdx].solution}</pre>
                                                </div>
                                                <p className="mt-3 text-[10px] italic text-[#888]">Ab is code ko khud se likhein taake aap ki practice ho!</p>
                                            </div>
                                            <Button onClick={handleVerify} disabled={isVerifying} className="w-full bg-primary text-black font-black py-4 rounded-xl text-[10px] uppercase tracking-widest">
                                                RE-VERIFY CODE
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button onClick={handleVerify} disabled={isVerifying} className="w-full bg-primary text-black font-black py-4 rounded-xl text-[10px] uppercase tracking-widest">
                                            {isVerifying ? 'Verifying...' : 'VERIFY MY CODE'}
                                        </Button>
                                    )}
                                </motion.div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-[#333] space-y-4">
                        <Sparkles className="h-12 w-12 opacity-20" />
                        <p className="text-sm font-medium">Select a file or Switch to Study Mode</p>
                    </div>
                )}
                
                <AnimatePresence>
                    {isTerminalExpanded && (
                        <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: 200 }}
                            exit={{ height: 0 }}
                            className="absolute bottom-0 left-0 right-0 bg-[#080808] border-t border-white/5 z-20 flex flex-col overflow-hidden"
                        >
                            <div className="h-7 border-b border-white/5 flex items-center justify-between px-4 cursor-pointer" onClick={() => setIsTerminalExpanded(false)}>
                                <span className="text-[9px] font-black uppercase text-[#666] flex items-center gap-1.5"><TerminalIcon className="h-3 w-3" /> Output</span>
                                <ChevronDown className="h-3 w-3 text-[#555]" />
                            </div>
                            <div className="flex-1 p-4 font-mono text-[12px] text-green-400 overflow-auto custom-scrollbar">
                                <pre>{output || '// No output...'}</pre>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function StudyInterface({ 
    onStartPractice,
    currentSlideIdx,
    setCurrentSlideIdx,
    currentStep,
    setCurrentStep,
    courseStarted,
    setCourseStarted
}: { 
    onStartPractice: (idx: number) => void,
    currentSlideIdx: number,
    setCurrentSlideIdx: (idx: number | ((prev: number) => number)) => void,
    currentStep: 'intro' | 'explanation' | 'quiz' | 'practice',
    setCurrentStep: (step: 'intro' | 'explanation' | 'quiz' | 'practice') => void,
    courseStarted: boolean,
    setCourseStarted: (started: boolean) => void
}) {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [showQuizResult, setShowQuizResult] = useState(false);
    const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
    const [language, setLanguage] = useState<'en' | 'ur'>('en');
    
    const slide = OOPS_COURSE[currentSlideIdx];
    const quiz = slide.quiz[currentQuizIdx];

    useEffect(() => {
        setCurrentQuizIdx(0);
        setSelectedOption(null);
        setShowQuizResult(false);
    }, [currentSlideIdx, setCurrentQuizIdx, setSelectedOption, setShowQuizResult]);

    const handleNext = () => {
        if (currentStep === 'intro') setCurrentStep('explanation');
        else if (currentStep === 'explanation') setCurrentStep('quiz');
        else if (currentStep === 'quiz') {
            if (showQuizResult) {
                if (currentQuizIdx < slide.quiz.length - 1) {
                    setCurrentQuizIdx(prev => prev + 1);
                    setSelectedOption(null);
                    setShowQuizResult(false);
                } else {
                    setCurrentStep('practice');
                    setCurrentQuizIdx(0);
                }
            }
        }
        else if (currentStep === 'practice') {
            if (currentSlideIdx < OOPS_COURSE.length - 1) {
                setCurrentSlideIdx(prev => prev + 1);
                setCurrentStep('intro');
                setSelectedOption(null);
                setShowQuizResult(false);
            }
        }
    };

    const handleBack = () => {
        if (currentStep === 'practice') {
            setCurrentStep('quiz');
            setCurrentQuizIdx(slide.quiz.length - 1);
        }
        else if (currentStep === 'quiz') {
            if (currentQuizIdx > 0) {
                setCurrentQuizIdx(prev => prev - 1);
                setSelectedOption(null);
                setShowQuizResult(false);
            } else {
                setCurrentStep('explanation');
            }
        }
        else if (currentStep === 'explanation') setCurrentStep('intro');
        else if (currentSlideIdx > 0) {
            setCurrentSlideIdx(prev => prev - 1);
            setCurrentStep('practice');
        }
    };

    if (!courseStarted) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0c0c0c] text-center">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-xl space-y-8">
                    <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <GraduationCap className="h-10 w-10 text-primary" />
                    </div>
                    <div className="space-y-4">
                        <Image src="https://raw.githubusercontent.com/Hassam990/synapse/refs/heads/main/Synapse.png" alt="Synapse Logo" width={250} height={60} className="mx-auto mb-4 opacity-80" />
                        <h1 className="text-5xl font-black text-white tracking-tighter italic">OOPS MASTER</h1>
                        <p className="text-lg text-[#666] font-medium leading-relaxed">Sabaq aur practice, dono ek saath. No failing anymore! 🇵🇰</p>
                    </div>
                    <Button 
                        size="lg" 
                        onClick={() => setCourseStarted(true)}
                        className="bg-primary text-black font-black px-12 py-8 rounded-2xl text-lg hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-all active:scale-95"
                    >
                        START LEARNING
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-[#0c0c0c] overflow-hidden">
            <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#080808] shrink-0 gap-4">
                <div className="flex items-center gap-4 shrink-0">
                    <Link href="/" className="hover:opacity-80 transition-opacity flex items-center gap-3">
                        <Image src="https://raw.githubusercontent.com/Hassam990/synapse/refs/heads/main/Synapse.png" alt="Synapse Logo" width={100} height={25} className="opacity-60" />
                        <div className="h-4 w-[1px] bg-white/10 hidden md:block" />
                        <h2 className="text-[11px] font-black text-white/40 tracking-widest uppercase truncate hidden md:block">MASTER</h2>
                    </Link>
                </div>
                
                {/* SLIDE NAVIGATION SLIDER */}
                <div className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-2 px-4 border-l border-r border-white/5">
                    {OOPS_COURSE.map((s, idx) => (
                        <button 
                            key={s.id}
                            onClick={() => {
                                setCurrentSlideIdx(idx);
                                setCurrentStep('intro');
                            }}
                            className={cn(
                                "shrink-0 px-3 py-1 rounded-full text-[9px] font-black transition-all border",
                                currentSlideIdx === idx 
                                    ? "bg-primary text-black border-primary" 
                                    : "bg-white/5 text-[#555] border-transparent hover:border-white/10 hover:text-white"
                            )}
                        >
                            {idx + 1}. {s.title}
                        </button>
                    ))}
                </div>

                <div className="flex bg-[#111] rounded-lg p-1 border border-white/5 h-8 shrink-0">
                    <button onClick={() => setLanguage('en')} className={cn("px-3 text-[9px] font-black rounded-md transition-all", language === 'en' ? "bg-primary text-black" : "text-[#555]")}>ENGLISH</button>
                    <button onClick={() => setLanguage('ur')} className={cn("px-3 text-[9px] font-black rounded-md transition-all", language === 'ur' ? "bg-primary text-black" : "text-[#555]")}>ROMAN URDU</button>
                </div>
            </div>

            <div className="h-1 bg-[#1a1a1a] flex shrink-0">
                {['intro', 'explanation', 'quiz', 'practice'].map((s, idx) => (
                    <div key={s} className={cn("flex-1 transition-all duration-500", ['intro', 'explanation', 'quiz', 'practice'].indexOf(currentStep) >= idx ? "bg-primary" : "bg-transparent")} />
                ))}
            </div>

            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar flex flex-col items-center relative">
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={currentSlideIdx + '-' + currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="max-w-3xl w-full space-y-10"
                    >
                        {currentStep === 'intro' && <h3 className="text-4xl font-black text-white italic tracking-tight text-center">"{slide.intro[language]}"</h3>}
                        {currentStep === 'explanation' && <p className="text-[#ccc] text-2xl font-medium leading-[1.6] italic text-center whitespace-pre-wrap">{slide.explanation[language]}</p>}
                        {currentStep === 'quiz' && (
                            <div className="space-y-6 max-w-xl mx-auto">
                                <p className="text-xl text-white font-bold mb-6">{quiz.question}</p>
                                <div className="grid grid-cols-1 gap-3">
                                    {quiz.options.map((option, idx) => (
                                        <button 
                                            key={idx} 
                                            onClick={() => !showQuizResult && setSelectedOption(option)} 
                                            className={cn("w-full p-5 rounded-2xl text-left text-sm font-bold border-2 transition-all", selectedOption === option ? "bg-primary/20 border-primary text-white" : "bg-[#080808] border-white/5 text-[#888]")}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                                {!showQuizResult && selectedOption && <Button onClick={() => setShowQuizResult(true)} className="w-full bg-white text-black font-black py-6 rounded-2xl">CHECK ANSWER</Button>}
                                {showQuizResult && (
                                    <div className="p-4 rounded-xl bg-[#111] border border-white/5 space-y-1">
                                        <p className={cn("text-xs font-black uppercase", selectedOption === quiz.answer ? "text-green-500" : "text-red-500")}>{selectedOption === quiz.answer ? 'Sahi Jawab!' : 'Galat Jawab!'}</p>
                                        <p className="text-[#666] text-[11px] leading-relaxed">{quiz.explanation}</p>
                                    </div>
                                )}
                            </div>
                        )}
                        {currentStep === 'practice' && (
                            <div className="space-y-8 text-center">
                                <p className="text-2xl text-white font-bold">{slide.practice[0].description}</p>
                                <Button onClick={() => onStartPractice(currentSlideIdx)} className="bg-primary text-black font-black px-12 py-8 rounded-2xl text-lg hover:shadow-[0_0_30px_rgba(34,197,94,0.3)]">LOAD INTO IDE & SOLVE</Button>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="h-20 border-t border-white/5 flex items-center justify-between px-10 bg-[#080808] shrink-0">
                <Button variant="ghost" onClick={handleBack} disabled={currentSlideIdx === 0 && currentStep === 'intro'} className="text-[#666] font-black uppercase text-[10px] tracking-widest gap-2"><ArrowLeft className="h-4 w-4" /> PREVIOUS</Button>
                <Button onClick={handleNext} disabled={currentStep === 'quiz' && !showQuizResult} className="bg-primary text-black font-black uppercase text-[10px] tracking-widest gap-2 px-8 py-6 rounded-xl">NEXT <ArrowRight className="h-4 w-4" /></Button>
            </div>
        </div>
    );
}

export default function CodeBuilderPage() {
    const [activeActivity, setActiveActivity] = useState<'explorer' | 'study'>('explorer');
    const [showExplorer, setShowExplorer] = useState(true);
    const [practiceSlideIdx, setPracticeSlideIdx] = useState<number | null>(null);
    
    // Lifted Study State
    const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
    const [currentStep, setCurrentStep] = useState<'intro' | 'explanation' | 'quiz' | 'practice'>('intro');
    const [courseStarted, setCourseStarted] = useState(false);

    return (
        <div className="h-screen w-full bg-[#050505] flex flex-col overflow-hidden text-[#aaa] font-sans selection:bg-primary/30 selection:text-white">
            <div className="flex-1 flex min-h-0 min-w-0">
                <div className="w-14 border-r border-white/5 flex flex-col items-center py-4 bg-[#080808] shrink-0 gap-2">
                    <div 
                        className={cn("p-2 cursor-pointer transition-colors rounded-lg", activeActivity === 'explorer' && showExplorer ? "text-primary bg-primary/5" : "text-[#555] hover:text-[#aaa]")} 
                        onClick={() => {
                            if (activeActivity === 'explorer') {
                                setShowExplorer(!showExplorer);
                            } else {
                                setActiveActivity('explorer');
                                setShowExplorer(true);
                            }
                        }}
                        title="Explorer"
                    >
                        <Files className="h-6 w-6" />
                    </div>
                    <div 
                        className={cn("p-2 cursor-pointer transition-colors rounded-lg", activeActivity === 'study' ? "text-primary bg-primary/5" : "text-[#555] hover:text-[#aaa]")} 
                        onClick={() => setActiveActivity('study')}
                        title="Study Mode"
                    >
                        <GraduationCap className="h-6 w-6" />
                    </div>
                    <div className="mt-auto p-2 text-[#444] hover:text-[#888] cursor-pointer">
                        <Settings className="h-6 w-6" />
                    </div>
                </div>

                <div className="flex-1 flex min-h-0 bg-[#0c0c0c] overflow-hidden">
                    {activeActivity === 'explorer' ? (
                        <CodeBuilderInterface 
                            practiceSlideIdx={practiceSlideIdx}
                            onClosePractice={() => setPracticeSlideIdx(null)}
                            onNextSlide={() => {
                                if (currentSlideIdx < OOPS_COURSE.length - 1) {
                                    setCurrentSlideIdx(currentSlideIdx + 1);
                                    setCurrentStep('explanation');
                                    setPracticeSlideIdx(null);
                                    setActiveActivity('study');
                                } else {
                                    setPracticeSlideIdx(null);
                                    setActiveActivity('study');
                                }
                            }}
                        />
                    ) : (
                        <StudyInterface 
                            currentSlideIdx={currentSlideIdx}
                            setCurrentSlideIdx={setCurrentSlideIdx}
                            currentStep={currentStep}
                            setCurrentStep={setCurrentStep}
                            courseStarted={courseStarted}
                            setCourseStarted={setCourseStarted}
                            onStartPractice={(idx) => {
                                setPracticeSlideIdx(idx);
                                setActiveActivity('explorer');
                            }} 
                        />
                    )}
                </div>
            </div>

            <footer className="h-6 bg-primary flex items-center justify-between px-3 text-[10px] text-black font-black shrink-0 pointer-events-none">
                <div className="flex items-center gap-4">
                     <span className="flex items-center gap-1.5 uppercase tracking-wider"><Code className="h-3.5 w-3.5" /> MAIN*</span>
                     <span className="flex items-center gap-1.5 uppercase tracking-wider"><Sparkles className="h-3.5 w-3.5" /> AI READY</span>
                </div>
                <div className="flex items-center gap-3 opacity-80">
                    <span>UTF-8</span>
                    <span>PYTHON 3.10</span>
                </div>
            </footer>
        </div>
    );
}
