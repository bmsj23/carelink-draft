import { getDoctorById } from '../actions'
import BookingForm from './booking-form'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4 mb-4">
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
    </div>
  )
}