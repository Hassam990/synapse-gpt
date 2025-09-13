import ChatInterface from '@/components/chat-interface';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="py-6 px-4 md:px-8">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">
            SYNAPSE
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 mt-1">
            Pakistan’s First GPT
          </p>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <ChatInterface />
      </main>

      <footer className="py-6 px-4 md:px-8">
        <div className="container mx-auto text-center">
          <p className="text-sm text-foreground/60">
            By Muhammad Jahanzaib Azam
          </p>
          <p className="text-xs text-foreground/50">
            CEO & Founder – SYNAPSE
          </p>
        </div>
      </footer>
    </div>
  );
}
