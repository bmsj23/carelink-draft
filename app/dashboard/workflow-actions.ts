'use server'

import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'

const consultationSchema = z.object({
  appointmentId: z.string().uuid({ message: 'Missing appointment for consultation.' }),
})

const messageSchema = z.object({
  appointmentId: z.string().uuid({ message: 'Missing appointment context.' }),
  content: z.string().min(1, 'Message cannot be empty.').max(2000, 'Message is too long.'),
})

const documentSchema = z.object({
  title: z.string().min(1, 'Document title is required.').max(120, 'Title is too long.'),
  fileUrl: z.string().url('Provide a valid document link.'),
  appointmentId: z.string().uuid().optional(),
})

const refillSchema = z.object({
  prescriptionId: z.string().uuid({ message: 'Missing prescription id.' }),
  note: z.string().max(500, 'Note is too long.').optional(),
})

const reminderSchema = z.object({
  appointmentId: z.string().uuid({ message: 'Missing appointment id.' }),
  reminderType: z.string().min(1, 'Reminder type is required.').max(120, 'Reminder type is too long.'),
})

async function getAuthedClient() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return { error: 'You must be signed in to perform this action.' }
  }

  return { supabase, user }
}

export async function joinConsultation(payload: unknown) {
  const parsed = consultationSchema.safeParse(payload)

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid consultation request.'
    return { error: message }
  }

  const authed = await getAuthedClient()
  if ('error' in authed) {
    return { error: authed.error }
  }

  const sessionUrl = `https://telemed.carelink/session/${parsed.data.appointmentId}-${crypto.randomUUID()}`

  const { data, error } = await authed.supabase
    .from('consultations')
    .upsert({ appointment_id: parsed.data.appointmentId, session_url: sessionUrl }, { onConflict: 'appointment_id' })
    .select()
    .single()

  if (error) {
    console.error('Error joining consultation:', error)
    return { error: 'Unable to create a consultation link right now. Please try again.' }
  }

  return { sessionUrl: data.session_url }
}

export async function postMessage(payload: unknown) {
  const parsed = messageSchema.safeParse(payload)

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid message data.'
    return { error: message }
  }

  const authed = await getAuthedClient()
  if ('error' in authed) {
    return { error: authed.error }
  }

  const { data, error } = await authed.supabase
    .from('messages')
    .insert({
      appointment_id: parsed.data.appointmentId,
      sender_id: authed.user.id,
      content: parsed.data.content,
    })
    .select()
    .single()

  if (error) {
    console.error('Error posting message:', error)
    return { error: 'We could not send your message. Please try again.' }
  }

  return { message: data }
}

export async function uploadDocument(payload: unknown) {
  const parsed = documentSchema.safeParse(payload)

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid document data.'
    return { error: message }
  }

  const authed = await getAuthedClient()
  if ('error' in authed) {
    return { error: authed.error }
  }

  const { data, error } = await authed.supabase
    .from('documents')
    .insert({
      owner_id: authed.user.id,
      title: parsed.data.title,
      file_url: parsed.data.fileUrl,
      appointment_id: parsed.data.appointmentId ?? null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error uploading document metadata:', error)
    return { error: 'Unable to save your document link. Please try again.' }
  }

  return { document: data }
}

export async function requestRefill(payload: unknown) {
  const parsed = refillSchema.safeParse(payload)

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid refill request.'
    return { error: message }
  }

  const authed = await getAuthedClient()
  if ('error' in authed) {
    return { error: authed.error }
  }

  const { data, error } = await authed.supabase
    .from('refill_requests')
    .insert({
      prescription_id: parsed.data.prescriptionId,
      patient_id: authed.user.id,
      note: parsed.data.note ?? null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating refill request:', error)
    return { error: 'We could not submit your refill request. Please try again.' }
  }

  return { request: data }
}

export async function markReminderSent(payload: unknown) {
  const parsed = reminderSchema.safeParse(payload)

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid reminder payload.'
    return { error: message }
  }

  const authed = await getAuthedClient()
  if ('error' in authed) {
    return { error: authed.error }
  }

  const sentAt = new Date().toISOString()

  const { data, error } = await authed.supabase
    .from('reminders')
    .upsert({
      appointment_id: parsed.data.appointmentId,
      reminder_type: parsed.data.reminderType,
      sent_at: sentAt,
    }, {
      onConflict: 'appointment_id,reminder_type',
    })
    .select()
    .single()

  if (error) {
    console.error('Error marking reminder sent:', error)
    return { error: 'Unable to record reminder status right now.' }
  }

  return { reminder: data }
}
