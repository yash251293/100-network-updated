# PostgreSQL Setup Instructions for Flexbone Project

This guide provides instructions to install PostgreSQL, start the service, create a dedicated database and user for the Flexbone project, and grant necessary privileges.

**Important Security Note:** The password `flexbone_password` is provided for ease of setup. **In a real or production environment, you must choose a strong, unique password.**

## 1. Install PostgreSQL

Choose the instructions relevant to your operating system.

### Ubuntu/Debian Linux

```bash
# Update your package list
sudo apt update

# Install PostgreSQL and its client utilities
sudo apt install -y postgresql postgresql-contrib

# Verify installation (optional)
psql --version
```

### macOS (using Homebrew)

If you don't have Homebrew, install it first from [brew.sh](https://brew.sh/).

```bash
# Install PostgreSQL
brew install postgresql

# To have launchd start postgresql now and restart at login:
brew services start postgresql
# Or, if you don't want/need a background service you can just run:
# pg_ctl -D /usr/local/var/postgres start

# Verify installation (optional)
psql --version
```
**Note for macOS users:** Homebrew might install a specific version (e.g., `postgresql@15`). Adjust commands if necessary. The `pg_ctl` path might also vary based on your Homebrew setup (e.g. for Apple Silicon it might be `/opt/homebrew/var/postgres`). If `brew services start postgresql` works, that is generally easier.


## 2. Start the PostgreSQL Service

For many installations, PostgreSQL will start automatically after installation. If not, use the appropriate command.

### Ubuntu/Debian Linux (using systemd)

```bash
# Start the PostgreSQL service if it's not already running
sudo systemctl start postgresql

# Enable it to start on boot (optional, but recommended for servers)
sudo systemctl enable postgresql

# Check the status of the service
sudo systemctl status postgresql
```

### macOS (using Homebrew)

If you used `brew services start postgresql` during installation, it should already be running.
If you opted for manual control:

```bash
# Start PostgreSQL (if you haven't used brew services)
# The path to pg_ctl and your data directory (-D) might vary.
# Check your Homebrew installation details if this command fails.
# Common path for Intel Macs:
pg_ctl -D /usr/local/var/postgres start
# Common path for Apple Silicon Macs:
# pg_ctl -D /opt/homebrew/var/postgres start

# To stop it:
# pg_ctl -D /usr/local/var/postgres stop
```

## 3. Create Database and User

These commands are typically run using the `psql` command-line utility, often as the default `postgres` superuser.

```bash
# Access the psql shell as the default postgres user
sudo -u postgres psql
```

If `sudo -u postgres psql` doesn't work (common on macOS or if you didn't create a `postgres` Linux user), you might be able to run `psql postgres` or just `psql` if your current OS user has permissions.

Once inside the `psql` shell, execute the following SQL commands:

```sql
-- Create the database user
CREATE USER flexbone_user WITH PASSWORD 'flexbone_password';

-- Create the database
CREATE DATABASE flexbone_db OWNER flexbone_user;

-- Connect to the new database to verify (optional)
\c flexbone_db

-- You should see a message like "You are now connected to database "flexbone_db" as user "postgres"."
-- or as the user you connected with.

-- Exit psql
\q
```

**Again, remember to change `'flexbone_password'` to a strong password in a real environment.**

## 4. Grant Privileges

Now, grant the necessary privileges to `flexbone_user` on the `flexbone_db` database.
Access `psql` again if you exited:

```bash
sudo -u postgres psql
```
Or, if you can connect directly to your new database as the `postgres` user (or another superuser):
```bash
sudo -u postgres psql -d flexbone_db
```

Then, execute the following SQL command:

```sql
-- Grant all privileges on the flexbone_db database to flexbone_user
GRANT ALL PRIVILEGES ON DATABASE flexbone_db TO flexbone_user;

-- (Optional but often needed) Grant privileges on all tables in the public schema (and future tables)
-- If you plan to use the schema.sql file provided for the project, the user will need these.
-- Connect to the database first if you haven't: \c flexbone_db
GRANT ALL PRIVILEGES ON SCHEMA public TO flexbone_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO flexbone_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO flexbone_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO flexbone_user;

-- To ensure flexbone_user can create future tables and objects with these privileges
-- and that objects created by flexbone_user are accessible by them.
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO flexbone_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO flexbone_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO flexbone_user;
```

After running these commands:
```sql
-- Exit psql
\q
```

Your PostgreSQL environment should now be ready for the Flexbone project. You can connect to the `flexbone_db` database as `flexbone_user` using the password `flexbone_password`.

You can then use the `schema.sql` file to create the tables:
```bash
psql -U flexbone_user -d flexbone_db -h localhost -f path/to/your/schema.sql
```
You will be prompted for the `flexbone_password`.```json
{"action": "submit_subtask_report", "action_input": {"summary": "Created a markdown file named `POSTGRESQL_SETUP.md` containing detailed instructions and commands for setting up PostgreSQL for the project. The guide covers:\n\n1.  **Installation of PostgreSQL:** Commands are provided for Ubuntu/Debian systems (using `apt`) and macOS (using `brew`).\n2.  **Starting the PostgreSQL Service:** Instructions for `systemctl` (Linux) and `brew services` or `pg_ctl` (macOS).\n3.  **Creating the Database and User:**\n    *   Database Name: `flexbone_db`\n    *   User: `flexbone_user`\n    *   Password: `flexbone_password` (with a strong advisory to change it for production environments).\n    SQL commands to be run via `psql` are provided for these operations.\n4.  **Granting Privileges:** SQL commands to grant `ALL PRIVILEGES` to `flexbone_user` on `flexbone_db` are included. It also includes commands to grant privileges on the `public` schema and future objects within it, which is important for when the user applies the `schema.sql`.\n\nThe instructions are organized clearly with operating system-specific sections and notes for common issues or variations (like Homebrew paths on different Mac architectures). It also includes a final command showing how to use the previously created `schema.sql` file with the new database and user.", "succeeded": true}}
```
