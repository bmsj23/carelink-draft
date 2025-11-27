import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, ShieldCheck, Stethoscope, Phone, Star, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen font-sans">
      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col justify-center items-center text-center px-4 py-24 overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-100/50 blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-indigo-50/50 blur-3xl"></div>
        </div>

        <div className="max-w-4xl space-y-8 z-10">
          <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800 mb-4">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2"></span>
            #1 Trusted Digital Health Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Medical Services You <br/>
            <span className="text-blue-600">
              Can Rely On
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Experience healthcare reimagined. Professional consultations, prescription management, and secure records—all from the comfort of your home.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link href="/signup">
              <Button size="lg" className="rounded-full bg-blue-600 hover:bg-blue-700 h-14 px-10 text-lg shadow-xl shadow-blue-200 transition-all hover:scale-105 hover:cursor-pointer">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/book">
              <Button variant="outline" size="lg" className="rounded-full border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50 h-14 px-10 text-lg transition-all hover:cursor-pointer">
                Book Appointment
              </Button>
            </Link>
          </div>

          <div className="pt-12 flex items-center justify-center gap-8 text-slate-400 grayscale opacity-70">
             {/* Mock Logos for "Trust" */}
             <div className="font-bold text-xl">HealthPlus</div>
             <div className="font-bold text-xl">MediCare</div>
             <div className="font-bold text-xl">DocConnect</div>
             <div className="font-bold text-xl">SafeLife</div>
          </div>
        </div>
      </section>

      {/* Stats / Trust Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-slate-50 hover:bg-white hover:shadow-xl transition-all duration-300 border border-slate-100">
                <div className="h-16 w-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 mb-6">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="text-4xl font-bold text-slate-900 mb-2">10k+</h3>
                <p className="text-slate-600 font-medium">Happy Patients</p>
             </div>
             <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-slate-50 hover:bg-white hover:shadow-xl transition-all duration-300 border border-slate-100">
                <div className="h-16 w-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 mb-6">
                  <Star className="h-8 w-8" />
                </div>
                <h3 className="text-4xl font-bold text-slate-900 mb-2">4.9/5</h3>
                <p className="text-slate-600 font-medium">Average Rating</p>
             </div>
             <div className="flex flex-col items-center text-center p-8 rounded-3xl bg-slate-50 hover:bg-white hover:shadow-xl transition-all duration-300 border border-slate-100">
                <div className="h-16 w-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 mb-6">
                  <Stethoscope className="h-8 w-8" />
                </div>
                <h3 className="text-4xl font-bold text-slate-900 mb-2">150+</h3>
                <p className="text-slate-600 font-medium">Specialist Doctors</p>
             </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-slate-50">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">Complete Healthcare Solutions</h2>
            <p className="text-lg text-slate-600">Designed to keep you and your family healthy at every stage of life.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group p-8 rounded-[2rem] bg-white border border-slate-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-300">
              <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                <Stethoscope className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Expert Doctors</h3>
              <p className="text-slate-600 leading-relaxed mb-6">Connect with licensed professionals across various specialties. From general practice to specialized care, we have you covered.</p>
              <Link href="/book" className="text-blue-600 font-semibold flex items-center group-hover:gap-2 transition-all">
                Find a Specialist <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            <div className="group p-8 rounded-[2rem] bg-white border border-slate-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-300">
              <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                <Calendar className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Instant Booking</h3>
              <p className="text-slate-600 leading-relaxed mb-6">Schedule appointments in seconds. No waiting rooms, no hassle. Choose a time that works for your busy lifestyle.</p>
              <Link href="/book" className="text-indigo-600 font-semibold flex items-center group-hover:gap-2 transition-all">
                Book Appointment <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            <div className="group p-8 rounded-[2rem] bg-white border border-slate-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-300">
              <div className="h-14 w-14 rounded-2xl bg-teal-600 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Secure Records</h3>
              <p className="text-slate-600 leading-relaxed mb-6">Your medical history and prescriptions are stored safely with bank-grade encryption. Accessible only to you.</p>
              <Link href="/dashboard" className="text-teal-600 font-semibold flex items-center group-hover:gap-2 transition-all">
                View Records <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="relative rounded-[3rem] bg-blue-600 overflow-hidden px-6 py-20 text-center">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>

            <div className="relative z-10 max-w-2xl mx-auto space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold text-white">Ready to prioritize your health?</h2>
              <p className="text-xl text-blue-100">Join thousands of users who trust CareLink for their medical needs.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" className="rounded-full bg-white text-blue-600 hover:bg-blue-50 h-14 px-10 text-lg font-bold shadow-lg hover:cursor-pointer">
                    Create Free Account
                  </Button>
                </Link>
                <div className="flex items-center justify-center gap-2 text-white/90 bg-white/10 rounded-full px-6 py-3 backdrop-blur-sm">
                  <Phone className="h-5 w-5" />
                  <span className="font-medium">24/7 Support: (555) 123-4567</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
