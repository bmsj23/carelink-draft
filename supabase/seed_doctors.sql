-- Insert sample doctors with stable IDs so appointments can reference them
insert into public.doctors (id, name, specialty, bio, image_url)
values
  ('11111111-2222-3333-4444-555555555555', 'Dr. Sarah Wilson', 'General Practitioner', 'Experienced GP with a focus on preventative care and family medicine.', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070&auto=format&fit=crop'),
  ('22222222-3333-4444-5555-666666666666', 'Dr. Michael Chen', 'Cardiologist', 'Specialist in heart health and cardiovascular diseases.', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop'),
  ('33333333-4444-5555-6666-777777777777', 'Dr. Emily Rodriguez', 'Dermatologist', 'Expert in treating skin conditions and cosmetic dermatology.', 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=2070&auto=format&fit=crop'),
  ('44444444-5555-6666-7777-888888888888', 'Dr. James Baker', 'Dentist', 'Providing comprehensive dental care for all ages.', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=2128&auto=format&fit=crop'),
  ('55555555-6666-7777-8888-999999999999', 'Dr. Olivia Parker', 'Pediatrician', 'Dedicated to the health and well-being of children and adolescents.', 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?q=80&w=1974&auto=format&fit=crop')
on conflict (id) do nothing;
