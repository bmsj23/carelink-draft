'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function getDoctors() {
  const supabase = await createClient()
  const { data: doctors, error } = await supabase
    .from('doctors')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching doctors:', error)
    return []
  }

  return doctors
}

export async function getDoctorById(id: string) {
  const supabase = await createClient()
  const { data: doctor, error } = await supabase
    .from('doctors')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching doctor:', error)
    return null
  }

  return doctor
}

export async function createAppointment(formData: FormData) {
  const supabase = await createClient()

  const doctorId = formData.get('doctorId') as string
  const date = formData.get('date') as string
  const time = formData.get('time') as string
  const notes = formData.get('notes') as string

  // Combine date and time
  const appointmentDate = new Date(`${date}T${time}:00`)

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to book an appointment' }
  }

  const { error } = await supabase
    .from('appointments')
    .insert({
      patient_id: user.id,
      doctor_id: doctorId,
      date: appointmentDate.toISOString(),
      notes: notes,
      status: 'confirmed' // Auto-confirm for hackathon simplicity
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/appointments')
  redirect('/dashboard?booked=true')
}
