'use server'

import { createClient } from '@/utils/supabase/server'

export async function getDashboardData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { appointments: [], prescriptions: [], user: null }
  }

  // Fetch appointments with doctor details
  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      *,
      doctors (
        name,
        specialty,
        image_url
      )
    `)
    .eq('patient_id', user.id)
    .order('date', { ascending: true })

  // Fetch prescriptions
  const { data: prescriptions } = await supabase
    .from('prescriptions')
    .select('*')
    .eq('patient_id', user.id)
    .order('created_at', { ascending: false })

  return { appointments: appointments || [], prescriptions: prescriptions || [], user }
}
