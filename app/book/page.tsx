import { getDoctors } from './actions'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image' // Although we use external URLs, Image component is good practice if configured.
// For hackathon speed with external random URLs, standard img tag might be easier to avoid domain config,
// but let's try to use a simple div with background or just an img tag for now to avoid next.config.js hassle.

export default async function BookPage() {
  const doctors = await getDoctors()

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-blue-900 mb-8">Find a Specialist</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doctor) => (
          <Card key={doctor.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gray-200 relative">
              {/* Using standard img for external URLs to avoid config setup during hackathon */}
              <img
                src={doctor.image_url || 'https://placehold.co/600x400?text=Doctor'}
                alt={doctor.name}
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader>
              <div className="text-sm font-medium text-blue-600 mb-1">{doctor.specialty}</div>
              <CardTitle className="text-xl">{doctor.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 line-clamp-3 text-sm">
                {doctor.bio}
              </p>
            </CardContent>
            <CardFooter>
              <Link href={`/book/${doctor.id}`} className="w-full">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Book Appointment
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
