#!/bin/bash
set -e

# Create expense_flow_test database alongside default expense_flow_dev
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    SELECT 'CREATE DATABASE expense_flow_test'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'expense_flow_test')\gexec
EOSQL

