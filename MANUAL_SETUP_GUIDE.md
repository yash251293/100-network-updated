# Manual Prisma Setup Guide

This guide provides the necessary steps to set up Prisma and the initial SQLite database in your local development environment. This is required because automated execution of these steps failed.

## Step 1: Ensure Project Dependencies are Installed

If you haven't already, or if you're unsure, run `pnpm install` in your terminal (at the project root) to make sure all project dependencies are installed:

```bash
pnpm install
```

Next, check your `package.json`:
- Ensure `"prisma"` is listed under `"devDependencies"`.
- Ensure `"@prisma/client"` is listed under `"dependencies"`.

If they are missing, add them by running:

```bash
pnpm add -D prisma
pnpm add @prisma/client
```

## Step 2: Run the Prisma Migration

This is the core step. It will:
- Create your SQLite database file (`prisma/dev.db`).
- Create all the tables and columns based on the `prisma/schema.prisma` file.
- Generate the Prisma Client library that your application code will use.

Run the following command in your terminal:

```bash
npx prisma migrate dev --name init
```

- **`npx prisma migrate dev`**: This command is for creating and applying migrations during development.
- **`--name init`**: This gives a name to your first migration (e.g., "init").

**What to Expect During Migration:**
- Prisma will analyze `prisma/schema.prisma`.
- A new SQL migration file will be generated in a new directory under `prisma/migrations/` (e.g., `prisma/migrations/TIMESTAMP_init/migration.sql`).
- This migration will be applied to your SQLite database. You should see `prisma/dev.db` created.
- Prisma Client will be automatically generated/updated in `node_modules/.prisma/client`.

## Step 3: Verify Prisma Client Generation (Optional but Recommended)

After the migration, Prisma Client should be up-to-date. You can explicitly run the generate command if you want to be sure:

```bash
npx prisma generate
```

## Troubleshooting

- **Command Not Found (`npx`, `prisma`, `pnpm`):** Ensure Node.js, npm (which includes npx), and pnpm are correctly installed and in your system's PATH.
- **Prisma Errors During Migration:** If `prisma migrate dev` throws errors, they are often related to:
    - Syntax issues in `prisma/schema.prisma`. The error message should point to the problematic line.
    - Issues with the `DATABASE_URL` in your `.env` file (it should be `DATABASE_URL="file:./dev.db"` for this setup).
- **`.env` file:** Make sure your `.env` file at the root of the project contains the line: `DATABASE_URL="file:./dev.db"`

Once `npx prisma migrate dev --name init` completes successfully, your database will be set up, and Prisma Client will be ready to use. After these steps, please inform the AI assistant that the manual setup is complete.
