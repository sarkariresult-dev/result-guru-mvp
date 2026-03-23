-- ═══════════════════════════════════════════════════════════════
-- 001_extensions.sql - Result Guru
-- PostgreSQL extensions required by the full schema.
-- ═══════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp"        WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "pgcrypto"         WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "pg_trgm"          WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "unaccent"         WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "btree_gist"       WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_net"           WITH SCHEMA public;