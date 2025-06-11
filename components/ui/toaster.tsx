"use client"

import { Toaster as Sonner } from "sonner"
import { useTheme } from "next-themes" // Assuming useTheme is available due to ThemeProvider

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme() // Get theme from next-themes

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]} // Use the theme from next-themes
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          // Added some default styling for success and error toasts if not overridden by sonner itself
          success: "group-[.toast]:bg-green-500 group-[.toast]:text-white",
          error: "group-[.toast]:bg-red-500 group-[.toast]:text-white",

        },
      }}
      {...props}
    />
  )
}

export { Toaster }
