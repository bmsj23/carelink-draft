'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function addAppointmentNotes(appointmentId: string, notes: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('appointments')
    .update({ notes, status: 'completed' })
    .eq('id', appointmentId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/appointments')
  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function createPrescription(data: {
  appointmentId: string
  patientId: string
  medicationName: string
  dosage: string
  instructions: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // get doctor id from user
  const { data: doctor } = await supabase
    .from('doctors')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!doctor) {
    return { error: 'Doctor profile not found' }
  }

  const { error } = await supabase.from('prescriptions').insert({
    patient_id: data.patientId,
    doctor_id: doctor.id,
    medication_name: data.medicationName,
    dosage: data.dosage,
    instructions: data.instructions,
    status: 'active',
    refills_remaining: 3,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/appointments')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function cancelAppointment(appointmentId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', appointmentId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/appointments')
  revalidatePath('/dashboard')
  redirect('/dashboard')
}