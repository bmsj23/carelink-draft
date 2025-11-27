/* eslint-disable @next/next/no-img-element */
import { getDoctorById } from '../actions'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import BookingForm from './booking-form'

export default async function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const doctor = await getDoctorById(id)

  if (!doctor) {
    return <div>Doctor not found</div>
  }

  // Calculate tomorrow's date for min attribute
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4 mb-4">
             <img
                src={doctor.image_url || 'https://placehold.co/100x100?text=Dr'}
                alt={doctor.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-blue-100"
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
        <BookingForm doctorId={doctor.id} minDate={minDate} />
      </Card>
    </div>
  )
}