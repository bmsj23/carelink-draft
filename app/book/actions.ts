'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

export type Doctor = {
  id: string
  name: string
  specialty: string
  bio: string | null
  image_url: string | null
  created_at: string
}

const createAppointmentSchema = z.object({
  doctorId: z.string().uuid({ message: 'Choose a valid doctor.' }),
  date: z.string().min(1, 'Date is required.'),
  time: z.string().min(1, 'Time is required.'),
  notes: z.string().min(5, 'Please add a brief note about your visit.'),
})

export async function getDoctors(): Promise<Doctor[]> {
  const supabase = await createClient()
  
  const { data: doctors, error } = await supabase
    .from('doctors')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching doctors:', error)
    return []
  }

  return doctors ?? []
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

  const parsed = createAppointmentSchema.safeParse({
    doctorId: formData.get('doctorId'),
    date: formData.get('date'),
    time: formData.get('time'),
    notes: formData.get('notes'),
  })

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid appointment details.'
    return { error: message }
  }

  const appointmentDate = new Date(`${parsed.data.date}T${parsed.data.time}:00`)

  if (Number.isNaN(appointmentDate.getTime())) {
    return { error: 'Invalid appointment date or time.' }
  }

  const {
    data: { user } = { user: null },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to book an appointment' }
  }

  const { error } = await supabase
    .from('appointments')
    .insert({
      patient_id: user.id,
      doctor_id: parsed.data.doctorId,
      date: appointmentDate.toISOString(),
      notes: parsed.data.notes,
      status: 'confirmed', // Auto-confirm for hackathon simplicity
    })

  if (error) {
    console.error('Error creating appointment:', error)
    return { error: 'Unable to create appointment right now. Please try again.' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/appointments')
  redirect('/dashboard?booked=true')
}

export async function revalidateDoctors() {
  revalidatePath('/book')
}
