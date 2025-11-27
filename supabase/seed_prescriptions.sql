-- Insert sample prescriptions for the logged in user (you'll need to replace the patient_id with your actual user ID after running this, or just run it manually in Supabase dashboard)
-- For now, let's just create a function that inserts dummy prescriptions for a given user ID to make it easier.

create or replace function public.seed_prescriptions_for_user(target_user_id uuid)
returns void as $$
begin
  insert into public.prescriptions (patient_id, medication_name, dosage, status)
  values
    (target_user_id, 'Amoxicillin', '500mg - 3x daily', 'active'),
    (target_user_id, 'Lisinopril', '10mg - 1x daily', 'active'),
    (target_user_id, 'Atorvastatin', '20mg - 1x daily', 'active');
end;
$$ language plpgsql security definer;
