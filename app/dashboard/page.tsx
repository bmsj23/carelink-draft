import { getDashboardData } from './actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Pill, Plus, User } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ booked?: string }> }) {
  const { appointments, prescriptions, user } = await getDashboardData()

  if (!user) {
    redirect('/login')
  }

  const { booked } = await searchParams
  const showSuccess = booked === 'true'

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          Appointment booked successfully!
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">Welcome back, {user.user_metadata.full_name}</h1>
          <p className="text-gray-600">Here's an overview of your health journey.</p>
        </div>
        <Link href="/book">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Book New Appointment
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Appointments Section */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Upcoming Appointments
          </h2>

          {appointments.length === 0 ? (
            <Card className="bg-gray-50 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500 mb-4">No upcoming appointments</p>
                <Link href="/book">
                  <Button variant="outline">Find a Doctor</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {appointments.map((apt: any) => (
                <Card key={apt.id} className="overflow-hidden">
                  <div className="flex flex-col sm:flex-row">
                    <div className="bg-blue-50 p-6 flex flex-col items-center justify-center min-w-[120px] border-b sm:border-b-0 sm:border-r border-blue-100">
                      <span className="text-3xl font-bold text-blue-600">
                        {new Date(apt.date).getDate()}
                      </span>
                      <span className="text-sm font-medium text-blue-900 uppercase">
                        {new Date(apt.date).toLocaleString('default', { month: 'short' })}
                      </span>
                    </div>
                    <div className="p-6 flex-1 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{apt.doctors.name}</h3>
                        <p className="text-blue-600 text-sm font-medium mb-2">{apt.doctors.specialty}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="flex items-center gap-1">
                            <div className={`h-2 w-2 rounded-full ${apt.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                            <span className="capitalize">{apt.status}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Reschedule</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Prescriptions Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Pill className="h-5 w-5 text-blue-600" />
            Active Prescriptions
          </h2>

          {prescriptions.length === 0 ? (
            <Card className="bg-gray-50 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <Pill className="h-10 w-10 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">No active prescriptions</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {prescriptions.map((script: any) => (
                <Card key={script.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-bold">{script.medication_name}</CardTitle>
                    <CardDescription>{script.dosage}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">
                        Active
                      </span>
                      <Button size="sm" variant="secondary" className="h-8">Refill</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white border-none">
            <CardHeader>
              <CardTitle className="text-lg">Need Help?</CardTitle>
              <CardDescription className="text-blue-100">
                Our support team is available 24/7 for medical emergencies.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full text-blue-900 font-bold">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
