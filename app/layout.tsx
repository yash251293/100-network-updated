import type React from "react"
import type { Metadata } from "next/dist/lib/metadata/types/metadata-interface"
import { Inter, Lora, Abhaya_Libre } from "next/font/google"
import "./globals.css"
// import HeaderWrapper from "@/components/header-wrapper"; // Ensure Commented out
// import { ThemeProvider } from "@/components/theme-provider"; // Ensure Commented out
// import { SessionProvider } from "next-auth/react"; // Ensure Commented out

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
    <html lang="en" /* suppressHydrationWarning might not be needed if no client providers */ >
      <body className={`${inter.className} ${lora.variable} ${abhayaLibre.variable}`}>
        {/* <SessionProvider> */}
          {/* <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          > */}
            {/* The div below is for basic structure; bg-background might not work if ThemeProvider is out */}
            <div className="flex flex-col h-screen overflow-hidden"> {/* Removed bg-background for now */}
              {/* <HeaderWrapper /> */} {/* Ensure Commented out */}
              <main className="flex-1 overflow-auto px-4 py-3">{children}</main>
            </div>
          {/* </ThemeProvider> */}
        {/* </SessionProvider> */}
      </body>
    </html>
  )
}
