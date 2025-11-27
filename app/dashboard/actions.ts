'use server'

import { createClient } from '@/utils/supabase/server'

export async function getDashboardData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { patientAppointments: [], prescriptions: [], doctorAppointments: [], profile: null, doctorProfile: null, user: null }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  // Patient view
  if (profile?.role !== 'doctor') {
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

    const { data: prescriptions } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('patient_id', user.id)
      .order('created_at', { ascending: false })

    return {
      patientAppointments: appointments || [],
      prescriptions: prescriptions || [],
      doctorAppointments: [],
      doctorProfile: null,
      profile,
      user,
    }
  }

  // Doctor view
  const { data: doctorProfile } = await supabase
    .from('doctors')
    .select('*')
    .eq('name', profile.full_name || '')
    .maybeSingle()

  const doctorId = doctorProfile?.id

  const { data: doctorAppointments } = doctorId
    ? await supabase
        .from('appointments')
        .select(`
          *,
          patient:patient_id (
            full_name,
            email
          ),
          doctors (
            name,
            specialty
          )
        `)
        .eq('doctor_id', doctorId)
        .order('date', { ascending: true })
    : { data: [] }

  return {
    patientAppointments: [],
    prescriptions: [],
    doctorAppointments: doctorAppointments || [],
    doctorProfile: doctorProfile || null,
    profile,
    user,
  }
}
