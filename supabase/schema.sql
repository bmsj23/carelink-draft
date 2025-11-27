-- CareLink Database Schema (Fresh Start)
-- Run this entire file in Supabase SQL Editor

-- ============================================
-- 1. PROFILES TABLE (links to auth.users)
-- ============================================
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  role text check (role in ('patient', 'doctor')) default 'patient',
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- ============================================
-- 2. DOCTORS TABLE
-- ============================================
create table public.doctors (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  name text not null,
  specialty text not null,
  bio text,
  image_url text,
  is_available boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.doctors enable row level security;

create policy "Doctors are viewable by everyone." on public.doctors for select using (true);
create policy "Users can create their own doctor profile." on public.doctors for insert with check (auth.uid() = user_id);
create policy "Doctors can update their own profile." on public.doctors for update using (auth.uid() = user_id);

-- ============================================
-- 3. APPOINTMENTS TABLE
-- ============================================
create table public.appointments (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.profiles(id) on delete cascade not null,
  doctor_id uuid references public.doctors(id) on delete cascade not null,
  date timestamp with time zone not null,
  status text check (status in ('pending', 'confirmed', 'completed', 'cancelled')) default 'pending',
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.appointments enable row level security;

create policy "Patients can view their own appointments." on public.appointments for select using (auth.uid() = patient_id);
create policy "Doctors can view their appointments." on public.appointments for select using (
  exists (select 1 from public.doctors where doctors.id = appointments.doctor_id and doctors.user_id = auth.uid())
);
create policy "Patients can insert their own appointments." on public.appointments for insert with check (auth.uid() = patient_id);
create policy "Patients can update their own appointments." on public.appointments for update using (auth.uid() = patient_id);
create policy "Doctors can update their appointments." on public.appointments for update using (
  exists (select 1 from public.doctors where doctors.id = appointments.doctor_id and doctors.user_id = auth.uid())
);

-- ============================================
-- 4. PRESCRIPTIONS TABLE
-- ============================================
create table public.prescriptions (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.profiles(id) on delete cascade not null,
  doctor_id uuid references public.doctors(id) on delete set null,
  medication_name text not null,
  dosage text not null,
  instructions text,
  refills_remaining integer default 0,
  status text check (status in ('active', 'completed', 'expired')) default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.prescriptions enable row level security;

create policy "Patients can view their own prescriptions." on public.prescriptions for select using (auth.uid() = patient_id);
create policy "Doctors can view prescriptions they created." on public.prescriptions for select using (
  exists (select 1 from public.doctors where doctors.id = prescriptions.doctor_id and doctors.user_id = auth.uid())
);
create policy "Doctors can insert prescriptions." on public.prescriptions for insert with check (
  exists (select 1 from public.doctors where doctors.user_id = auth.uid())
);

-- ============================================
-- 5. MEDICATION ORDERS TABLE
-- ============================================
create table public.medication_orders (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.profiles(id) on delete cascade not null,
  prescription_id uuid references public.prescriptions(id) on delete set null,
  medication_name text not null,
  quantity integer default 1,
  status text check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')) default 'pending',
  ordered_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.medication_orders enable row level security;

create policy "Patients can view their own orders." on public.medication_orders for select using (auth.uid() = patient_id);
create policy "Patients can create orders." on public.medication_orders for insert with check (auth.uid() = patient_id);

-- ============================================
-- 6. REMINDERS TABLE
-- ============================================
create table public.reminders (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references public.profiles(id) on delete cascade not null,
  type text check (type in ('appointment', 'medication', 'refill', 'follow_up')) not null,
  title text not null,
  remind_at timestamp with time zone not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.reminders enable row level security;

create policy "Patients can manage their own reminders." on public.reminders for all using (auth.uid() = patient_id);

-- ============================================
-- 7. INDEXES FOR PERFORMANCE
-- ============================================
create index idx_appointments_patient on public.appointments(patient_id);
create index idx_appointments_doctor on public.appointments(doctor_id);
create index idx_appointments_date on public.appointments(date);
create index idx_prescriptions_patient on public.prescriptions(patient_id);
create index idx_orders_patient on public.medication_orders(patient_id);
create index idx_reminders_patient on public.reminders(patient_id);

-- ============================================
-- 8. AUTO-CREATE PROFILE ON SIGNUP
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'patient')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
