-- ═══════════════════════════════════════════════════════════════
-- 001_extensions.sql — Result Guru
-- PostgreSQL extensions required by the full schema.
-- Run ONCE against the target database before all other migrations.
-- ═══════════════════════════════════════════════════════════════

-- UUIDs as primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"        WITH SCHEMA public;

-- gen_random_bytes() for unsubscribe tokens
CREATE EXTENSION IF NOT EXISTS "pgcrypto"         WITH SCHEMA public;

-- Trigram similarity for title autocomplete / fuzzy search
CREATE EXTENSION IF NOT EXISTS "pg_trgm"          WITH SCHEMA public;

-- Accent-insensitive full-text search (Hindi transliteration safe)
CREATE EXTENSION IF NOT EXISTS "unaccent"         WITH SCHEMA public;

-- GiST indexes for range exclusion and JSONB containment
CREATE EXTENSION IF NOT EXISTS "btree_gist"       WITH SCHEMA public;

-- Slow-query profiling — enable in production, optional in dev
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";