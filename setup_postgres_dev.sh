#!/bin/bash

# --- Configuration ---
DB_NAME="app_dev_db"
DB_USER="app_user"
DB_PASS="app_password" # Be sure to use a strong password in production!

# --- Script Logic ---

# Determine the command to execute SQL
# On Linux, typically sudo -u postgres psql
# On macOS with Homebrew, psql postgres might be sufficient if your user has rights
# This is a heuristic, adjust if necessary for your specific setup.
if command -v sudo >/dev/null && sudo -n -u postgres psql -c "" >/dev/null 2>&1; then
    PSQL_CMD="sudo -u postgres psql"
elif command -v psql >/dev/null; then
    PSQL_CMD="psql -d postgres" # Connect to the default 'postgres' db to run create user/db commands
else
    echo "ERROR: Cannot find psql command or suitable execution method."
    echo "Please ensure PostgreSQL is installed and psql is in your PATH."
    echo "You may need to run the SQL commands manually within psql."
    exit 1
fi

echo "Using PSQL command: $PSQL_CMD"
echo "Attempting to create user '$DB_USER' and database '$DB_NAME'..."

# SQL Commands
# Use a heredoc for multiline SQL commands
# Attempt to drop user and database first to ensure a clean setup, ignoring errors if they don't exist.
# Note: In a production script, you might want more careful checks.
SQL_PRE_CLEANUP=$(cat <<EOF
DROP DATABASE IF EXISTS ${DB_NAME};
DROP USER IF EXISTS ${DB_USER};
EOF
)

SQL_SETUP_COMMANDS=$(cat <<EOF
CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';
CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
ALTER DATABASE ${DB_NAME} SET TIMEZONE TO 'UTC'; -- Optional: Set default timezone
EOF
)

echo "Executing Pre-cleanup SQL commands (dropping existing user/db if they exist - errors ignored here):"
echo "${SQL_PRE_CLEANUP}"
echo "----------------------"
$PSQL_CMD -c "${SQL_PRE_CLEANUP}" >/dev/null 2>&1 || true # Execute and ignore errors

echo "Executing Setup SQL commands:"
echo "${SQL_SETUP_COMMANDS}"
echo "----------------------"

if $PSQL_CMD -c "${SQL_SETUP_COMMANDS}"; then
    echo "----------------------"
    echo "PostgreSQL setup completed successfully."
    echo "Database: ${DB_NAME}"
    echo "User:     ${DB_USER}"
    echo "Password: ${DB_PASS}"
    echo ""
    echo "Connection String Example (for many applications):"
    echo "postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}"
else
    echo "----------------------"
    echo "ERROR: PostgreSQL setup failed."
    echo "This might be due to permission issues or other errors."
    echo "Check the output above for details."
    exit 1
fi

exit 0
