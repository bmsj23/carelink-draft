'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? new URL(process.env.NEXT_PUBLIC_SITE_URL).toString().replace(/\/$/, '')
  : 'http://localhost:3000'

const createAppointmentSchema = z.object({
  doctorId: z.string().uuid({ message: 'Choose a valid doctor.' }),
  date: z.string().min(1, 'Date is required.'),
  time: z.string().min(1, 'Time is required.'),
  notes: z.string().min(5, 'Please add a brief note about your visit.'),
})

export async function getDoctors() {
  const response = await fetch(`${baseUrl}/api/doctors`, {
    next: { revalidate: 3600, tags: ['doctors'] },
  })

  if (!response.ok) {
    console.error('Error fetching doctors:', response.statusText)
    return []
  }

  const doctors = await response.json()
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
  revalidateTag('doctors')
  revalidatePath('/book')
}
