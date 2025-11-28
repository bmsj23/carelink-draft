import { getDoctorById } from '../actions'
import BookingForm from './booking-form'
import { GuestPreConsultForm } from './guest-preconsult-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import { redirect } from 'next/navigation'

export default async function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const doctor = await getDoctorById(resolvedParams.id)

  if (!doctor) {
    redirect('/book')
  }

  const minDate = new Date()
  minDate.setHours(0, 0, 0, 0)
  const minDateStr = minDate.toISOString().split('T')[0]

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="mb-4 flex items-center gap-4">
                <Image
                  src={doctor.image_url || 'https://placehold.co/100x100?text=Dr'}
                  alt={doctor.name}
                  width={64}
                  height={64}
                  className="rounded-full object-cover border-2 border-blue-100"
                  priority
                />
                <div>
                  <CardTitle className="text-2xl">Book with {doctor.name}</CardTitle>
                  <CardDescription className="text-blue-600 font-medium">{doctor.specialty}</CardDescription>
                </div>
              </div>
              <CardDescription>
                Complete the form below to schedule your consultation.
              </CardDescription>
            </CardHeader>
            <BookingForm doctorId={doctor.id} minDate={minDateStr} />
          </Card>

          <Card className="border-slate-200 bg-slate-50">
            <CardHeader>
              <CardTitle className="text-lg">Try a quick guest consult</CardTitle>
              <CardDescription>
                Save your symptoms securely without creating an account. You’ll be prompted to sign up to finalize booking or prescriptions.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <GuestPreConsultForm doctorId={doctor.id} />
            </CardContent>
          </Card>
        </div>

        <Card className="border-slate-200 bg-white">
          <CardContent className="pt-6 text-sm text-slate-600">
            <p className="font-medium text-slate-900">Privacy reminders</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>Guest entries avoid personal identifiers and expire after 24 hours.</li>
              <li>Booking, prescriptions, and follow-ups require a full account to meet regulatory requirements.</li>
              <li>Sessions are protected by Supabase Row Level Security and scoped to your browser.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}