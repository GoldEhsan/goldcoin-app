-- update_schema_v2.sql
-- This script updates the GameProfiles table.
-- It sets the current balance of all existing profiles to 0
-- and changes the default balance for all new profiles to 0.
-- Please run this script in your Supabase project's SQL Editor.

-- Update existing rows to reset their balance
UPDATE public.GameProfiles
SET balance = 0;

-- Alter the table to change the default for new rows
ALTER TABLE public.GameProfiles
ALTER COLUMN balance SET DEFAULT 0;
