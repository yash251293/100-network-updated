import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react'; // Required if you test React components, good to have
import path from 'path';

export default defineConfig({
  plugins: [react()], // For processing React components if any tests import them
  test: {
    globals: true, // Use Vitest global APIs (describe, it, expect, etc.) without importing
    environment: 'node', // Or 'jsdom' if you are testing frontend components that need a DOM
    setupFiles: [], // Path to setup files, e.g., './tests/setup.ts' if needed
    include: ['tests/**/*.test.ts'], // Pattern to find test files
    alias: {
      '@': path.resolve(__dirname, '.'), // To match Next.js path aliases like @/lib/db
    },
    // Optional: Configuration for @vitest/ui
    // reporters: ['default', 'html'], // Default reporter + HTML report for UI
    // coverage: { // Optional: Code coverage configuration
    //   provider: 'v8', // or 'istanbul'
    //   reporter: ['text', 'json', 'html'],
    //   reportsDirectory: './coverage'
    // },
  },
});
