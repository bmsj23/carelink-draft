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

-- Documents for storing AI summaries and uploads
create table public.documents (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.profiles(id) not null,
  appointment_id uuid references public.appointments(id),
  title text not null,
  content text not null,
  doc_type text check (doc_type in ('ai_summary', 'upload', 'note')) default 'ai_summary',
  prompt text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.documents enable row level security;

-- Consultation notes saved from AI or clinicians
create table public.consultation_notes (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.profiles(id) not null,
  appointment_id uuid references public.appointments(id),
  summary text not null,
  note_type text check (note_type in ('previsit', 'prescription', 'next_steps', 'clinician')) default 'clinician',
  prompt text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.consultation_notes enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

create policy "Doctors are viewable by everyone." on public.doctors for select using (true);

create policy "Patients can view their own appointments." on public.appointments for select using (auth.uid() = patient_id);
create policy "Patients can insert their own appointments." on public.appointments for insert with check (auth.uid() = patient_id);

create policy "Patients can view their own prescriptions." on public.prescriptions for select using (auth.uid() = patient_id);

create policy "Patients can view their own documents." on public.documents for select using (auth.uid() = patient_id);
create policy "Patients can insert their own documents." on public.documents for insert with check (auth.uid() = patient_id);
create policy "Patients can view their own consultation notes." on public.consultation_notes for select using (auth.uid() = patient_id);
create policy "Patients can insert their own consultation notes." on public.consultation_notes for insert with check (auth.uid() = patient_id);

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
