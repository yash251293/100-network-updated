# Git Merge and Project Setup Guide (CMD for Windows)

This guide provides step-by-step CMD commands to update your local `master` branch with the latest Auth.js v5 refactor, clean your project environment, and set up the database. Please run these from the root directory of your project (e.g., `C:\Users\YourUser\Desktop\100-network-updated-feature-initial-functionality-setup>`).

**IMPORTANT:** If any command results in an error or unexpected output, please copy the command and its full output and share it with the AI assistant before proceeding.

## Step 1: Commit Your Local Dependency Changes

If you manually ran `pnpm add next-auth@beta @auth/prisma-adapter bcryptjs` and potentially `pnpm remove next-auth` (for v4), commit these changes first. If the AI assistant handled package changes (even if simulated due to tool errors), you might be able to skip this specific commit, but it's safer to ensure your `package.json` and `pnpm-lock.yaml` reflect the Auth.js v5 dependencies.

```cmd
git add package.json pnpm-lock.yaml
```
*(If you get an error like "'pnpm-lock.yaml' did not match any files" or if no changes are staged, that's okay. Proceed to the next command.)*

```cmd
git commit -m "chore: Update dependencies for Auth.js v5"
```
*(If it says "nothing to commit", that's also okay.)*

## Step 2: Fetch Latest Branches from Remote
This ensures your local git repository knows about all the branches from the remote, including the branch containing the Auth.js v5 setup (e.g., `origin/feature/auth-v5-with-guide` - **the AI will provide the exact branch name**).
```cmd
git fetch origin
```

## Step 3: Merge Auth.js v5 Refactor into Your Master Branch
Replace `THE_AUTH_V5_BRANCH_NAME` with the actual branch name provided by the AI.
This will bring the new authentication code (Auth.js v5) into your local `master` branch.
```cmd
git merge origin/THE_AUTH_V5_BRANCH_NAME
```
**Watch for Merge Conflicts:**
- If the output of this command mentions "merge conflict" or "Automatic merge failed; fix conflicts and then commit the result," **STOP** and show the full output to the AI assistant. Do not proceed until conflicts are resolved.
- If it says "Merge made by..." or "Already up to date," then the merge was successful.

## Step 4: Clean Up Database and Migrations
To ensure a fresh start for the database schema:
*   Delete the SQLite database file (if it exists):
    ```cmd
    del prisma\dev.db
    ```
    *(If it says "Could Not Find," that's okay).*
*   Remove the existing migrations folder completely:
    ```cmd
    rd /s /q prisma\migrations
    ```

## Step 5: Clean Up `node_modules`, `.next` Folder, and Lockfile
This ensures a completely clean build and dependency installation.
```cmd
rd /s /q node_modules
```
Then:
```cmd
rd /s /q .next
```
Then:
```cmd
del pnpm-lock.yaml
```

## Step 6: Perform a Clean Install of All Dependencies
This will install all packages based on the updated `package.json` (a new lockfile will be generated).
```cmd
pnpm install
```
- Review the output. You may still see peer dependency warnings related to React 19 for `react-day-picker` and `vaul` – this is okay for now. Ensure there are no `ERESOLVE` errors for critical packages like `next-auth` or `@auth/prisma-adapter`.

## Step 7: Test the Development Server
Now, try to run the development server with the new Auth.js v5 code.
```cmd
pnpm run dev
```
**Observe the terminal output carefully:**
- Does the server start successfully?
- **Crucially, is the "React Context is unavailable in Server Components" error GONE?** (This was a primary motivation for the Auth.js v5 migration).

**If the server starts without the context error:**
- Open `http://localhost:3000` in your browser.
    - You should see the minimal home page content.
- Test basic authentication:
    - Navigate to `/auth/signup` and try to register a new user.
    - Navigate to `/auth/login` and try to log in with the new user.
    - Does login redirect you (e.g., to `/feed`)?
    - The main header UI might still be missing or look different if `HeaderWrapper` is still commented out in `app/layout.tsx` from previous debugging steps. This is fine for this stage of testing.

## Step 8: Run Prisma Migration (If Dev Server is Stable)
If `pnpm run dev` runs without the "React Context" error and basic site navigation seems okay:
1.  Stop the dev server (Ctrl+C in the terminal).
2.  Run the Prisma migration to create your database schema based on the latest `prisma/schema.prisma` (which includes User, Company, Post, PasswordResetToken models, but **not yet the `Like` model**):
    ```cmd
    npx prisma migrate dev --name initial_schema_with_auth_v5
    ```
3.  This command should complete successfully, creating `prisma/dev.db` and a migration file.

After completing all these steps, please inform the AI assistant of the outcome of each major step (especially the `git merge`, `pnpm run dev`, and `npx prisma migrate dev` commands). This will determine the next steps, such as restoring the full UI for `app/page.tsx` and `app/layout.tsx`, and then proceeding with the `Like` model migration.
