'use client';

import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { useState, useEffect } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isDark, setIsDark] = useState(false);


  useEffect(() => {
    // Always set light theme as default
    document.documentElement.classList.remove('dark');
    setIsDark(false);
  }, []);

  return (
    <html lang="en" className={isDark ? 'dark' : ''}>
      <head>
        <title>Quadbits</title>
        <meta name="description" content="Academic Futurism Design System" />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
