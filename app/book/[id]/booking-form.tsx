'use client'

import { createAppointment } from '../actions'
import { Button } from '@/components/ui/button'
import { CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar as CalendarIcon, Clock } from 'lucide-react'
import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 size-lg hover:cursor-pointer" disabled={pending}>
      {pending ? 'Booking...' : 'Confirm Appointment'}
    </Button>
  )
}

export default function BookingForm({ doctorId, minDate }: { doctorId: string, minDate: string }) {
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    const res = await createAppointment(formData)
    if (res?.error) {
      setError(res.error)
      toast.error(res.error)
    }
  }

  return (
    <form action={handleSubmit}>
      <input type="hidden" name="doctorId" value={doctorId} />
      <CardContent className="space-y-6">
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <div className="relative">
              <Input
                type="date"
                id="date"
                name="date"
                required
                min={minDate}
                className="pl-10"
              />
              <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <div className="relative">
              <Input
                type="time"
                id="time"
                name="time"
                required
                min="09:00"
                max="17:00"
                className="pl-10"
              />
              <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Reason for Visit</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Briefly describe your symptoms or reason for consultation..."
            required
          />
        </div>
      </CardContent>
      <CardFooter>
        <SubmitButton />
      </CardFooter>
    </form>
  )
}
