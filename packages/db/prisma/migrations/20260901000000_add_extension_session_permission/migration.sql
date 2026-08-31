-- AlterEnum
-- Adds EXTENSION as a new SessionPermission value.
-- This is purely additive: existing rows keep permission='REVEAL' unchanged.
-- Zero data migration required.
ALTER TYPE "SessionPermission" ADD VALUE 'EXTENSION';
