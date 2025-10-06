
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Progress } from '@/components/ui/progress';

export default function SplashScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // This effect can be used for any async tasks you need to run during startup.
    // For now, we just simulate a quick loading bar.
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Simulate a faster loading process
        return prev + 10;
      });
    }, 50); // Speed up the interval

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-background transition-opacity duration-500 ease-in-out">
      <div className="flex flex-col items-center gap-4 animate-[fade-in-zoom_1s_ease-in-out_forwards]">
        <Image
          src="https://raw.githubusercontent.com/Hassam990/synapse/refs/heads/main/Synapse.png"
          alt="SynapseGPT Logo"
          width={400}
          height={100}
          priority
        />
        <p className="text-lg text-muted-foreground">Pakistan’s First GPT-Powered AI</p>
      </div>
       {/* The progress bar is now just for show and won't block rendering */}
      <div className="absolute bottom-10 w-full max-w-md px-4">
        <Progress value={progress} className="h-2 w-full progress-bar-primary" />
      </div>
      <style jsx>{`
        @keyframes fade-in-zoom {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
