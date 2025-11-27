-- Insert demo patient profiles for hack demos
insert into public.profiles (id, email, full_name, role)
values
  ('aaaaaaa1-0000-0000-0000-000000000001', 'demo.patient1@example.com', 'Alexis Carter', 'patient'),
  ('aaaaaaa2-0000-0000-0000-000000000002', 'demo.patient2@example.com', 'Jordan Smith', 'patient'),
  ('aaaaaaa3-0000-0000-0000-000000000003', 'demo.patient3@example.com', 'Taylor Lee', 'patient')
on conflict (id) do nothing;
