'use client'

import { useState, useTransition } from 'react'
import { generateGeminiSummary } from './ai-actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { AlertTriangle, Loader2, ShieldCheck, Sparkles } from 'lucide-react'

interface AppointmentContext {
  id?: string
  doctorName?: string
  notes?: string | null
  date?: string
}

interface PrescriptionContext {
  medication_name: string
  dosage: string
  status: string
}

const quickActions = [
  {
    intent: 'prescription' as const,
    label: 'Ask about prescription',
    helper: 'Clarify medication purpose, timing, and safety flags.',
  },
  {
    intent: 'previsit' as const,
    label: 'Pre-visit symptom summary',
    helper: 'Create a clean, concise handoff for your clinician.',
  },
  {
    intent: 'next_steps' as const,
    label: 'Next steps summary',
    helper: 'Capture follow-up tasks and watchouts after the consult.',
  },
]

export function AiFollowUpPanel({
  appointment,
  prescriptions,
}: {
  appointment?: AppointmentContext
  prescriptions: PrescriptionContext[]
}) {
  const [consent, setConsent] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sanitizedPreview, setSanitizedPreview] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const prescriptionText = prescriptions
    .filter((rx) => rx.status === 'active')
    .map((rx) => `${rx.medication_name} (${rx.dosage})`)
    .join(', ')

  const contextParts = [
    appointment?.notes ? `Visit notes: ${appointment.notes}` : null,
    appointment?.doctorName ? `Clinician: ${appointment.doctorName}` : null,
    appointment?.date ? `Visit date: ${new Date(appointment.date).toLocaleString()}` : null,
    prescriptionText ? `Active prescriptions: ${prescriptionText}` : null,
  ].filter(Boolean)

  const context = contextParts.join('\n') || 'No recent visit data was provided.'

  function handleGenerate(intent: 'prescription' | 'previsit' | 'next_steps') {
    if (!consent) {
      setError('Please confirm consent to enable AI assistance.')
      return
    }

    setError(null)
    setMessage(null)
    setSanitizedPreview(null)

    startTransition(async () => {
      const result = await generateGeminiSummary({
        intent,
        context,
        appointmentId: appointment?.id,
      })

      if (result.error) {
        setError(result.error)
        return
      }

      setMessage(result.summary)
      setSanitizedPreview(result.sanitizedContext)
    })
  }

  return (
    <Card className="border-blue-100 shadow-sm">
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-2 text-blue-700">
          <Sparkles className="h-5 w-5" />
          <CardTitle className="text-xl">Gemini follow-up workspace</CardTitle>
        </div>
        <CardDescription className="space-y-1 text-gray-600">
          <p>
            AI tooling stays off until you opt in. When active, requests are sanitized before
            leaving CareLink and stored to your Documents and consultation notes.
          </p>
          <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 p-3 rounded-md">
            <AlertTriangle className="h-4 w-4 mt-0.5" />
            <span>Outputs are informational, not a substitute for clinical advice.</span>
          </div>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <label className="flex items-start gap-3 text-sm text-gray-700">
          <Checkbox id="ai-consent" checked={consent} onCheckedChange={(checked) => setConsent(Boolean(checked))} />
          <span className="leading-5">
            I consent to share redacted visit details with Gemini for drafting summaries and I understand
            the guidance is not medical advice.
          </span>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <Button
              key={action.intent}
              type="button"
              variant="outline"
              className="justify-start h-full text-left"
              disabled={isPending || !consent}
              onClick={() => handleGenerate(action.intent)}
            >
              <div className="space-y-1">
                <div className="font-semibold text-gray-800">{action.label}</div>
                <div className="text-xs text-gray-600">{action.helper}</div>
              </div>
            </Button>
          ))}
        </div>

        {isPending && (
          <div className="flex items-center gap-2 text-blue-700 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Drafting with Gemini...
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 p-3 rounded-md">
            <AlertTriangle className="h-4 w-4 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-800 font-semibold">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              Saved summary
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-line">{message}</p>
          </div>
        )}

        {sanitizedPreview && (
          <div className="rounded-md border border-dashed border-blue-200 p-3 bg-blue-50 text-xs text-blue-900">
            <div className="font-semibold mb-1">Sanitized payload sent to Gemini</div>
            <pre className="whitespace-pre-wrap break-words">{sanitizedPreview}</pre>
          </div>
        )}
      </CardContent>

      <CardFooter className="text-xs text-gray-500">
        Summaries are saved to your Documents library and consultation notes so your care team can review
        or update them later.
      </CardFooter>
    </Card>
  )
}
