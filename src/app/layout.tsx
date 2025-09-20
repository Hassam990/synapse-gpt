
'use client';

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { useEffect, useState } from 'react';
import SplashScreen from '@/components/splash-screen';

// This is a workaround to make metadata work with client components
// export const metadata: Metadata = {
//   title: 'Synapse Pakistan',
//   description: 'Pakistan’s First GPT-Powered AI',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000); // 3 seconds
    return () => clearTimeout(timer);
  }, []);

  return (
    <html lang="en" className="dark">
      <head>
        <title>Synapse Pakistan</title>
        <meta name="description" content="Pakistan’s First GPT-Powered AI" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        {loading ? (
          <SplashScreen />
        ) : (
          <>
            {children}
            <Toaster />
          </>
        )}
      </body>
    </html>
  );
}
