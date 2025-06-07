module.exports = {
  apps : [{
    name   : "my-nextjs-app-dev",
    // **IMPORTANT: Use the EXACT path you found from the 'find' command here:**
    script : "pnpm",
    args   : "dev",
    // Explicitly set the interpreter to your Node.js binary:
    cwd    : "/root/100-network-updated",
    env: {
      "NODE_ENV": "development",
      "POSTGRES_URL": "postgresql://flexbone_user:flexbone_password@5.189.179.61:5432/flexbone_db",
      "JWT_SECRET": "cc6f3149ee9e479cc3c8dfadaf45f4492022347b5a298dc0c5001b7086bb6bb5517bf7f3d71159b15d5d5e915d43d88ad9fc"
      // Optional: If your app needs its public URL (e.g., for password reset emails)
      // NEXT_PUBLIC_BASE_URL: 'http://100n.hopto.org',
    }
  }]
};
