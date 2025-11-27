-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  role text check (role in ('patient', 'doctor')) default 'patient',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Create doctors table
create table public.doctors (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  specialty text not null,
  bio text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.doctors enable row level security;

-- Create appointments table
create table public.appointments (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.profiles(id) not null,
  doctor_id uuid references public.doctors(id) not null,
  date timestamp with time zone not null,
  status text check (status in ('pending', 'confirmed', 'completed', 'cancelled')) default 'pending',
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.appointments enable row level security;

-- Create prescriptions table
create table public.prescriptions (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.profiles(id) not null,
  medication_name text not null,
  dosage text not null,
  status text check (status in ('active', 'completed')) default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.prescriptions enable row level security;

-- Create consultations table
create table public.consultations (
  id uuid default gen_random_uuid() primary key,
  appointment_id uuid references public.appointments(id) on delete cascade not null,
  session_url text,
  status text check (status in ('scheduled', 'active', 'completed', 'cancelled')) default 'scheduled',
  recording_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.consultations enable row level security;

-- Create consultation messages table
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  consultation_id uuid references public.consultations(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) not null,
  body text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.messages enable row level security;

-- Create documents table
create table public.documents (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.profiles(id) on delete cascade not null,
  type text not null,
  storage_path text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.documents enable row level security;

-- Create refill requests table
create table public.refill_requests (
  id uuid default gen_random_uuid() primary key,
  prescription_id uuid references public.prescriptions(id) on delete cascade not null,
  status text check (status in ('pending', 'approved', 'denied')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.refill_requests enable row level security;

-- Create reminders table
create table public.reminders (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.profiles(id) on delete cascade not null,
  target_type text not null,
  target_id uuid not null,
  due_at timestamp with time zone not null,
  sent_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.reminders enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

create policy "Doctors are viewable by everyone." on public.doctors for select using (true);

create policy "Patients can view their own appointments." on public.appointments for select using (auth.uid() = patient_id);
create policy "Patients can insert their own appointments." on public.appointments for insert with check (auth.uid() = patient_id);

create policy "Doctors can view their appointments." on public.appointments for select using (auth.uid() = doctor_id);
create policy "Doctors can update their appointments." on public.appointments for update using (auth.uid() = doctor_id);

create policy "Patients can view their own prescriptions." on public.prescriptions for select using (auth.uid() = patient_id);

create policy "Doctors can view prescriptions for their patients." on public.prescriptions for select using (
  exists (
    select 1
    from public.appointments a
    where a.patient_id = patient_id
      and a.doctor_id = auth.uid()
  )
);

create policy "Patients can manage their consultations." on public.consultations
  for all using (
    exists (
      select 1
      from public.appointments a
      where a.id = appointment_id
        and a.patient_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.appointments a
      where a.id = appointment_id
        and a.patient_id = auth.uid()
    )
  );

create policy "Doctors can manage their consultations." on public.consultations
  for all using (
    exists (
      select 1
      from public.appointments a
      where a.id = appointment_id
        and a.doctor_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.appointments a
      where a.id = appointment_id
        and a.doctor_id = auth.uid()
    )
  );

create policy "Participants can view consultation messages." on public.messages for select using (
  exists (
    select 1
    from public.consultations c
    join public.appointments a on a.id = c.appointment_id
    where c.id = consultation_id
      and (a.patient_id = auth.uid() or a.doctor_id = auth.uid())
  )
);

create policy "Participants can send consultation messages." on public.messages for insert with check (
  sender_id = auth.uid()
  and exists (
    select 1
    from public.consultations c
    join public.appointments a on a.id = c.appointment_id
    where c.id = consultation_id
      and (a.patient_id = auth.uid() or a.doctor_id = auth.uid())
  )
);

create policy "Patients can manage their documents." on public.documents
  for all using (auth.uid() = patient_id)
  with check (auth.uid() = patient_id);

create policy "Doctors can view documents for their patients." on public.documents for select using (
  exists (
    select 1
    from public.appointments a
    where a.patient_id = patient_id
      and a.doctor_id = auth.uid()
  )
);

create policy "Patients can manage their refill requests." on public.refill_requests
  for all using (
    exists (
      select 1
      from public.prescriptions p
      where p.id = prescription_id
        and p.patient_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.prescriptions p
      where p.id = prescription_id
        and p.patient_id = auth.uid()
    )
  );

create policy "Doctors can update refill requests for their patients." on public.refill_requests
  for select using (
    exists (
      select 1
      from public.prescriptions p
      join public.appointments a on a.patient_id = p.patient_id
      where p.id = prescription_id
        and a.doctor_id = auth.uid()
    )
  )
  for update using (
    exists (
      select 1
      from public.prescriptions p
      join public.appointments a on a.patient_id = p.patient_id
      where p.id = prescription_id
        and a.doctor_id = auth.uid()
    )
  );

create policy "Patients can manage their reminders." on public.reminders
  for all using (auth.uid() = patient_id)
  with check (auth.uid() = patient_id);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', coalesce(new.raw_user_meta_data->>'role', 'patient'));
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
