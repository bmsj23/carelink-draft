-- supabase/encrypt_existing_messages.sql

-- This script migrates existing plaintext chat messages to the new encrypted format.
-- It is designed to be idempotent, meaning it can be safely run multiple times.

-- Step 1: Temporarily disable the restrictive insert policy to allow updates.
alter table public.chat_messages disable row level security;

-- Step 2: Loop through all chat rooms and encrypt messages for each sender.
do $$
declare
  sender_record record;
begin
  for sender_record in select distinct sender_id from public.chat_messages where content is not null and content_encrypted is null
  loop
    -- Ensure the user has an encryption key. If not, create one.
    if not exists (select 1 from private.encryption_keys where user_id = sender_record.sender_id) then
      insert into private.encryption_keys (user_id, key)
      values (sender_record.sender_id, pgsodium.crypto_aead_det_keygen());
    end if;

    -- Update messages for the current sender
    update public.chat_messages
    set content_encrypted = public.encrypt_data(content, sender_id)
    where sender_id = sender_record.sender_id
      and content is not null
      and content_encrypted is null;
  end loop;
end;
$$;

-- Step 3: Nullify the old 'content' column for messages that have been encrypted.
update public.chat_messages
set content = null
where content_encrypted is not null and content is not null;

-- Step 4: Re-enable Row Level Security.
alter table public.chat_messages enable row level security;

-- Step 5: (Optional but recommended) Add a comment to the old column.
comment on column public.chat_messages.content is 'Deprecated. Use content_encrypted for new messages and the decrypted_chat_messages view for reading.';

select 'Migration complete. Existing messages have been encrypted.' as status;
