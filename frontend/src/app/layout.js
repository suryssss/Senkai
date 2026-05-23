import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Senkai - Architecture Risk Analyzer",
  description: "Visual system design intelligence tool for analyzing backend architecture risks",
};

import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#8b5cf6', // matching var(--accent-primary)
          colorBackground: '#0a0a0a', // matching var(--bg-primary)
          colorInputBackground: '#111111', // matching var(--bg-secondary)
          colorInputText: '#ffffff', // forced white
          colorText: '#ffffff', // forced white
          colorTextSecondary: '#a1a1aa', // light gray
          borderRadius: '8px',
        },
        elements: {
          card: {
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
            border: '1px solid #27272a', // var(--border-subtle)
            background: '#0a0a0a', // forcing background to match
          },
          headerTitle: { color: '#ffffff' },
          headerSubtitle: { color: '#a1a1aa' },
          formFieldLabel: { color: '#ffffff' },
          formFieldInput: { color: '#ffffff', background: '#111111' },
          otpCodeFieldInput: { color: '#ffffff', background: '#111111', borderColor: '#27272a' },
          socialButtonsBlockButton: { color: '#ffffff' },
          socialButtonsBlockButtonText: { color: '#ffffff' },
          dividerText: { color: '#a1a1aa' },
          footerActionText: { color: '#a1a1aa' },
          footerActionLink: { color: '#8b5cf6' },
          formButtonPrimary: { color: '#ffffff' },
          userButtonPopoverCard: { background: '#0a0a0a', border: '1px solid #27272a', color: '#ffffff' },
          userButtonPopoverActionButtonText: { color: '#ffffff' },
          userButtonPopoverActionButtonIcon: { color: '#ffffff' },
          userPreviewMainIdentifier: { color: '#ffffff' },
          userPreviewSecondaryIdentifier: { color: '#a1a1aa' },
          userButtonPopoverFooter: { display: 'none' },
          badge: { display: 'none' }, // Try hiding dev badge via API
          scrollBox: { paddingBottom: 0 },
        }
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
