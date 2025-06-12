import type React from "react"
import type { Metadata } from "next/dist/lib/metadata/types/metadata-interface"
import { Inter, Lora, Abhaya_Libre } from "next/font/google"
import "./globals.css"
// import HeaderWrapper from "@/components/header-wrapper"; // Still Commented out
import { ThemeProvider } from "@/components/theme-provider"; // ACTIVE
import { SessionProvider } from "next-auth/react"; // ACTIVE

const inter = Inter({ subsets: ["latin"] })
const lora = Lora({ 
  subsets: ["latin"],
  variable: "--font-lora",
  weight: ["400", "500", "600", "700"]
})
const abhayaLibre = Abhaya_Libre({ 
  subsets: ["latin"],
  variable: "--font-abhaya-libre",
  weight: ["400", "500", "600", "700", "800"]
})

export const metadata: Metadata = {
  title: "100 Networks",
  description: "Follow employers and find your dream job",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Ensuring no whitespace text node here. Next.js manages the actual <head> content.
          Adding an explicit <head /> tag is usually not necessary unless you have specific
          meta tags to place directly here, but it doesn't hurt for clarity. */}
      <head />
      <body className={`${inter.className} ${lora.variable} ${abhayaLibre.variable}`}>
        <SessionProvider> {/* ACTIVE */}
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            // disableTransitionOnChange // Assuming this was commented out or not present as per instructions
          >
            <div className="flex flex-col h-screen overflow-hidden bg-background">
              {/* <HeaderWrapper /> */} {/* Keep commented for initial test */}
              <main className="flex-1 overflow-auto px-4 py-3">{children}</main>
            </div>
          </ThemeProvider>
        </SessionProvider> {/* ACTIVE */}
      </body>
    </html>
  );
}
