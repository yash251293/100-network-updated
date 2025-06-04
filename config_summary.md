# Configuration Summary

## `next.config.mjs`

-   **ESLint**:
    -   `ignoreDuringBuilds`: true
-   **TypeScript**:
    -   `ignoreBuildErrors`: true
-   **Images**:
    -   `unoptimized`: true

## `tailwind.config.ts`

-   **darkMode**: `["class"]`
-   **Content Paths**:
    -   `./pages/**/*.{js,ts,jsx,tsx,mdx}`
    -   `./components/**/*.{js,ts,jsx,tsx,mdx}`
    -   `./app/**/*.{js,ts,jsx,tsx,mdx}`
    -   `*.{js,ts,jsx,tsx,mdx}`
-   **Theme Extensions**:
    -   **Colors**: Extensive custom color palette defined (background, foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, ring, chart, sidebar).
    -   **BorderRadius**: `lg`, `md`, `sm` defined using `var(--radius)`.
    -   **Keyframes**: `accordion-down`, `accordion-up`.
    -   **Animation**: `accordion-down`, `accordion-up`.
-   **Plugins**:
    -   `require("tailwindcss-animate")`

## `tsconfig.json`

-   **Compiler Options**:
    -   `target`: "ES6"
    -   `lib`: `["dom", "dom.iterable", "esnext"]`
    -   `allowJs`: true
    -   `skipLibCheck`: true
    -   `strict`: true
    -   `noEmit`: true
    -   `esModuleInterop`: true
    -   `module`: "esnext"
    -   `moduleResolution`: "bundler"
    -   `resolveJsonModule`: true
    -   `isolatedModules`: true
    -   `jsx`: "preserve"
    -   `incremental`: true
    -   `plugins`: `[{"name": "next"}]`
    -   `paths`: `{"@/*": ["./*"]}`
-   **Include**: `["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"]`
-   **Exclude**: `["node_modules"]`

## `components.json`

-   **$schema**: `https://ui.shadcn.com/schema.json`
-   **style**: "default"
-   **rsc**: true
-   **tsx**: true
-   **Tailwind Configuration**:
    -   `config`: "tailwind.config.ts"
    -   `css`: "app/globals.css"
    -   `baseColor`: "neutral"
    -   `cssVariables`: true
    -   `prefix`: ""
-   **Aliases**:
    -   `components`: "@/components"
    -   `utils`: "@/lib/utils"
    -   `ui`: "@/components/ui"
    -   `lib`: "@/lib"
    -   `hooks`: "@/hooks"
-   **iconLibrary**: "lucide"

## `package.json`

-   **Name**: "my-v0-project"
-   **Version**: "0.1.0"
-   **Private**: true
-   **Scripts**:
    -   `dev`: "next dev"
    -   `build`: "next build"
    -   `start`: "next start"
    -   `lint`: "next lint"
-   **Main Dependencies**:
    -   `@hookform/resolvers`: "^3.9.1"
    -   `@radix-ui/*`: Various versions (UI components)
    -   `autoprefixer`: "^10.4.20"
    -   `class-variance-authority`: "^0.7.1"
    -   `clsx`: "^2.1.1"
    -   `cmdk`: "1.0.4"
    -   `date-fns`: "4.1.0"
    -   `embla-carousel-react`: "8.5.1"
    -   `input-otp`: "1.4.1"
    -   `lucide-react`: "^0.454.0"
    -   `next`: "15.2.4"
    -   `next-themes`: "^0.4.4"
    -   `pg`: "^8.12.0"
    -   `react`: "^19"
    -   `react-day-picker`: "8.10.1"
    -   `react-dom`: "^19"
    -   `react-hook-form`: "^7.54.1"
    -   `react-resizable-panels`: "^2.1.7"
    -   `recharts`: "2.15.0"
    -   `sonner`: "^1.7.1"
    -   `tailwind-merge`: "^2.5.5"
    -   `tailwindcss-animate`: "^1.0.7"
    -   `vaul`: "^0.9.6"
    -   `zod`: "^3.24.1"
    -   `bcryptjs`: "^2.4.3"
-   **DevDependencies**:
    -   `@types/bcryptjs`: "^2.4.6"
    -   `@types/node`: "^22"
    -   `@types/pg`: "^8.11.0"
    -   `@types/react`: "^19"
    -   `@types/react-dom`: "^19"
    -   `postcss`: "^8"
    -   `tailwindcss`: "^3.4.17"
    -   `typescript`: "^5"
