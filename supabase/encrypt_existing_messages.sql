-- supabase/encrypt_existing_messages.sql

-- This script migrates existing plaintext chat messages to the new encrypted format using Supabase Vault.
-- It is designed to be idempotent, meaning it can be safely run multiple times.

-- Step 1: Temporarily disable RLS to update the table.
alter table public.chat_messages disable row level security;

-- Step 2: Create a temporary column to hold the new encrypted content.
alter table public.chat_messages add column content_temp vault.encrypted_secret;

-- Step 3: Update the temporary column with the encrypted content.
-- This will automatically encrypt the data.
update public.chat_messages
set content_temp = content::text
where content is not null;

-- Step 4: Drop the old content column.
alter table public.chat_messages drop column content;

-- Step 5: Rename the temporary column to content.
alter table public.chat_messages rename column content_temp to content;

-- Step 6: Re-enable Row Level Security.
alter table public.chat_messages enable row level security;

select 'Migration to Supabase Vault complete. Existing messages have been encrypted.' as status;
