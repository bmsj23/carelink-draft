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

-- Policies
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

create policy "Doctors are viewable by everyone." on public.doctors for select using (true);

create policy "Patients can view their own appointments." on public.appointments for select using (auth.uid() = patient_id);
create policy "Patients can insert their own appointments." on public.appointments for insert with check (auth.uid() = patient_id);

create policy "Patients can view their own prescriptions." on public.prescriptions for select using (auth.uid() = patient_id);

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

-- Consultation sessions for virtual visits
create table public.consultations (
  id uuid default gen_random_uuid() primary key,
  appointment_id uuid references public.appointments(id) unique not null,
  session_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.consultations enable row level security;
create policy "Patients manage their consultations." on public.consultations
  for all using (auth.uid() = (select patient_id from public.appointments where id = appointment_id));

-- Messages exchanged during consultations
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  appointment_id uuid references public.appointments(id) not null,
  sender_id uuid references public.profiles(id) not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.messages enable row level security;
create policy "Patients send consultation messages." on public.messages
  for insert with check (auth.uid() = sender_id and auth.uid() = (select patient_id from public.appointments where id = appointment_id));
create policy "Patients read their consultation messages." on public.messages
  for select using (auth.uid() = (select patient_id from public.appointments where id = appointment_id));

-- Documents uploaded by patients for appointments
create table public.documents (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) not null,
  title text not null,
  file_url text not null,
  appointment_id uuid references public.appointments(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.documents enable row level security;
create policy "Patients manage their documents." on public.documents
  for all using (auth.uid() = owner_id);

-- Prescription refill requests
create table public.refill_requests (
  id uuid default gen_random_uuid() primary key,
  prescription_id uuid references public.prescriptions(id) not null,
  patient_id uuid references public.profiles(id) not null,
  note text,
  status text check (status in ('pending', 'approved', 'denied')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.refill_requests enable row level security;
create policy "Patients create refill requests." on public.refill_requests
  for insert with check (auth.uid() = patient_id);
create policy "Patients view their refill requests." on public.refill_requests
  for select using (auth.uid() = patient_id);

-- Reminders tracking
create table public.reminders (
  id uuid default gen_random_uuid() primary key,
  appointment_id uuid references public.appointments(id) not null,
  reminder_type text not null,
  sent_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint reminder_unique unique (appointment_id, reminder_type)
);

alter table public.reminders enable row level security;
create policy "Patients track their reminders." on public.reminders
  for all using (auth.uid() = (select patient_id from public.appointments where id = appointment_id));
