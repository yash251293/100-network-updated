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
You will be prompted for the `flexbone_password`.

## 5. Configure Client Authentication (pg_hba.conf)

PostgreSQL uses a client authentication configuration file named `pg_hba.conf` to control which hosts are allowed to connect, which users can connect, which databases they can access, and the authentication method.

If you are unable to connect to the database as `flexbone_user` from your application or `psql` (even with the correct password), you might need to adjust this file.

**A. Find `pg_hba.conf`:**

You can find the location of this file by running the following command in `psql`:
```sql
SHOW hba_file;
```
Common locations:
*   Ubuntu/Debian: `/etc/postgresql/<VERSION>/main/pg_hba.conf` (e.g., `/etc/postgresql/14/main/pg_hba.conf`)
*   macOS (Homebrew): `/usr/local/var/postgres/pg_hba.conf` or `/opt/homebrew/var/postgres/pg_hba.conf`

**B. Edit `pg_hba.conf`:**

You will need superuser privileges to edit this file (e.g., use `sudo nano <path_to_pg_hba.conf>`).

Add or modify lines to allow `flexbone_user` to connect to `flexbone_db`. For local development, allowing connections from `localhost` (127.0.0.1 for IPv4, ::1 for IPv6) is common.

Look for lines similar to these:
```
# TYPE  DATABASE        USER            ADDRESS                 METHOD

# "local" is for Unix domain socket connections only
local   all             all                                     peer
# IPv4 local connections:
host    all             all             127.0.0.1/32            scram-sha-256
# IPv6 local connections:
host    all             all             ::1/128                 scram-sha-256
```

You need to ensure that `flexbone_user` can connect to `flexbone_db` using password authentication (e.g., `md5` or `scram-sha-256`).

Add these lines **before** any overly permissive `host all all` lines that might use `reject` or a more restrictive method for your local connection type. The order of rules matters.

```
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   flexbone_db     flexbone_user                           md5  # Or scram-sha-256 if your server default is that
host    flexbone_db     flexbone_user   127.0.0.1/32            md5  # Or scram-sha-256
host    flexbone_db     flexbone_user   ::1/128                 md5  # Or scram-sha-256
```

*   `local`: For Unix domain socket connections (connecting without specifying a hostname, e.g., `psql -U flexbone_user -d flexbone_db`).
*   `host`: For TCP/IP connections (e.g., from your application or `psql -h localhost ...`).
*   `md5` is a common password authentication method. `scram-sha-256` is more secure and the default on newer PostgreSQL versions. If `md5` doesn't work, try `scram-sha-256`. Check your PostgreSQL version's default or other entries in the file for clues. **Using `trust` is insecure and should be avoided.**

**C. Reload PostgreSQL Configuration:**

After saving changes to `pg_hba.conf`, you must reload the PostgreSQL configuration for the changes to take effect. You don't usually need to restart the entire server.

From your terminal (not inside `psql`):
```bash
# Ubuntu/Debian (using systemctl)
sudo systemctl reload postgresql

# macOS (using Homebrew services)
# If you started PostgreSQL using `brew services`:
brew services reload postgresql
# Or, using pg_ctl (path might vary):
# pg_ctl -D /usr/local/var/postgres reload
# pg_ctl -D /opt/homebrew/var/postgres reload
```
Or, you can execute this SQL command as a superuser in `psql`:
```sql
SELECT pg_reload_conf();
```

After these steps, try connecting as `flexbone_user` again.
