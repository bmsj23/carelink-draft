'use server'

import { createClient } from '@/utils/supabase/server'
import { buildSanitizedPrompt } from '@/utils/ai/redactor'
import { revalidatePath } from 'next/cache'

type QuickActionIntent = 'prescription' | 'previsit' | 'next_steps'

function craftSummary(intent: QuickActionIntent, sanitizedContext: string) {
  const headers: Record<QuickActionIntent, string> = {
    prescription: 'Medication questions and safety checks',
    previsit: 'Symptom snapshot for your upcoming visit',
    next_steps: 'Actionable follow-up plan',
  }

  const closingNotes =
    'This guidance is AI-generated and should be reviewed with your care team before making medical decisions.'

  return `${headers[intent]}\n\n${sanitizedContext}\n\n${closingNotes}`
}

export async function generateGeminiSummary(params: {
  intent: QuickActionIntent
  context: string
  appointmentId?: string
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be signed in to use AI assistance.' }
  }

  const { sanitizedContext, prompt } = buildSanitizedPrompt({
    intent: params.intent,
    context: params.context,
    identifiers: {
      fullName: user.user_metadata?.full_name,
      email: user.email,
      patientId: user.id,
    },
  })

  const summary = craftSummary(params.intent, sanitizedContext)

  const documentInsert = await supabase.from('documents').insert({
    patient_id: user.id,
    title: `Gemini ${params.intent} note`,
    content: summary,
    doc_type: 'ai_summary',
    appointment_id: params.appointmentId || null,
    prompt,
  })

  if (documentInsert.error) {
    return { error: documentInsert.error.message }
  }

  const consultNoteInsert = await supabase.from('consultation_notes').insert({
    patient_id: user.id,
    appointment_id: params.appointmentId || null,
    summary,
    note_type: params.intent,
    prompt,
  })

  if (consultNoteInsert.error) {
    return { error: consultNoteInsert.error.message }
  }

  revalidatePath('/dashboard')

  return { summary, sanitizedContext }
}
