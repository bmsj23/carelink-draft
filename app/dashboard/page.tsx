import { getDashboardData } from './actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  ClipboardList,
  Clock,
  FilePlus2,
  NotebookPen,
  Pill,
  Plus,
  Stethoscope,
} from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

type SearchParams = {
  booked?: string
}

type PatientAppointment = {
  id: string
  date: string
  status: string
  doctors: {
    name: string
    specialty: string
  }
}

type Prescription = {
  id: string
  medication_name: string
  dosage: string
  status: string
}

type DoctorAppointment = {
  id: string
  date: string
  status: string
  patient?: {
    full_name?: string
    email?: string
  }
}

export default async function DashboardPage({ searchParams }: { searchParams: SearchParams }) {
  const dashboardData = await getDashboardData()
  const user = dashboardData.user
  const profile = dashboardData.profile
  const patientAppointments = (dashboardData.patientAppointments || []) as PatientAppointment[]
  const prescriptions = (dashboardData.prescriptions || []) as Prescription[]
  const doctorAppointments = (dashboardData.doctorAppointments || []) as DoctorAppointment[]
  const doctorProfile = dashboardData.doctorProfile

  if (!user) {
    redirect('/login')
  }

  const showSuccess = searchParams?.booked === 'true'
  const role = profile?.role === 'doctor' ? 'doctor' : 'patient'

  const upcomingPatientAppointments = patientAppointments.slice(0, 4)
  const refillReminders = prescriptions.filter((script) => script.status === 'active').slice(0, 3)

  const doctorAppointmentsToday = doctorAppointments.filter((appt) => {
    const apptDate = new Date(appt.date)
    const now = new Date()
    return apptDate.toDateString() === now.toDateString()
  })

  const doctorQueue = doctorAppointments.filter((appt) => appt.status !== 'completed')

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
          <p className="text-gray-600">
            {role === 'doctor'
              ? 'Here is a snapshot of your clinic workflow for today.'
              : 'Here&apos;s an overview of your care journey.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={role === 'doctor' ? '/book' : '/book'}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              {role === 'doctor' ? 'Book on behalf' : 'Quick Book'}
            </Button>
          </Link>
          {role === 'doctor' && (
            <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
              {doctorProfile?.specialty || 'Doctor Mode'}
            </Badge>
          )}
        </div>
      </div>

      {role === 'doctor' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">Today&apos;s Schedule</h2>
              </div>
              <span className="text-sm text-gray-500">{doctorAppointmentsToday.length} visit(s)</span>
            </div>

            {doctorAppointmentsToday.length === 0 ? (
              <Card className="bg-gray-50 border-dashed">
                <CardContent className="py-10 text-center text-gray-500">
                  No appointments scheduled today.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {doctorAppointmentsToday.map((apt) => (
                  <Card key={apt.id}>
                    <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                          <Stethoscope className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{apt.patient?.full_name || 'Patient'}</h3>
                          <p className="text-sm text-gray-500">{apt.patient?.email}</p>
                          <div className="flex items-center gap-3 text-sm text-gray-500 mt-2">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <span className="px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                              {apt.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <NotebookPen className="h-4 w-4" />
                          Add Notes
                        </Button>
                        <Button variant="secondary" size="sm" className="flex items-center gap-1">
                          <FilePlus2 className="h-4 w-4" />
                          Prescription
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800">Patient Queue</h2>
            </div>

            {doctorQueue.length === 0 ? (
              <Card className="bg-gray-50 border-dashed">
                <CardContent className="py-8 text-center text-sm text-gray-500">
                  No patients waiting right now.
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-4 space-y-3">
                  {doctorQueue.map((apt) => (
                    <div key={apt.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{apt.patient?.full_name || 'Patient'}</p>
                        <p className="text-xs text-gray-500">{new Date(apt.date).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {apt.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none">
              <CardHeader>
                <CardTitle className="text-lg">Quick actions</CardTitle>
                <CardDescription className="text-blue-100">
                  Create a note or prescription before the visit.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Button variant="secondary" className="justify-start gap-2 text-blue-900 font-semibold">
                  <NotebookPen className="h-4 w-4" />
                  Start SOAP note
                </Button>
                <Button variant="secondary" className="justify-start gap-2 text-blue-900 font-semibold">
                  <FilePlus2 className="h-4 w-4" />
                  Draft prescription
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Upcoming Consults
            </h2>

            {upcomingPatientAppointments.length === 0 ? (
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
                {upcomingPatientAppointments.map((apt) => (
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

          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-800">Prescriptions</h2>
            </div>

            {prescriptions.length === 0 ? (
              <Card className="bg-gray-50 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <Pill className="h-10 w-10 text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500">No active prescriptions</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {prescriptions.map((script) => (
                  <Card key={script.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-bold">{script.medication_name}</CardTitle>
                      <CardDescription>{script.dosage}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <div className="flex justify-between items-center">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${script.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {script.status}
                        </span>
                        <Button size="sm" variant="secondary" className="h-8">Refill</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-blue-600" />
                  <CardTitle className="text-base">Refill reminders</CardTitle>
                </div>
                <CardDescription>Stay on top of your medications.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {refillReminders.length === 0 ? (
                  <p className="text-sm text-gray-500">You&apos;re all set for now.</p>
                ) : (
                  refillReminders.map((script) => (
                    <div key={script.id} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium text-gray-900">{script.medication_name}</p>
                        <p className="text-gray-500">Refill soon to avoid interruption.</p>
                      </div>
                      <Button size="sm" variant="outline">Refill</Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

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
      )}
    </div>
  )
}
