"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Calendar as CalendarIcon,
  Clock,
  Mail,
  Phone,
  Search,
  Sparkles,
  Stethoscope,
  UserRound,
  X,
} from "lucide-react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { createAppointment, type Doctor } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ContactInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
};

function SubmitButton({ canSubmit }: { canSubmit: boolean }) {
  const { pending } = useFormStatus();
  const disabled = pending || !canSubmit;
  return (
    <Button
      type="submit"
      disabled={disabled}
      className="w-full py-4 text-lg font-semibold bg-blue-600 hover:bg-blue-700 hover:cursor-pointer"
    >
      {pending ? "Booking..." : "Confirm Appointment"}
    </Button>
  );
}

export default function BookingForm({
  doctors,
  minDate,
  contactInfo,
  initialDoctorId,
}: {
  doctors: Doctor[];
  minDate: string;
  contactInfo: ContactInfo;
  initialDoctorId?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(
    initialDoctorId || ""
  );
  const [doctorModalOpen, setDoctorModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("all");

  const selectedDoctor = doctors.find(
    (doctor) => doctor.id === selectedDoctorId
  );

  const specialties = useMemo(() => {
    const uniq = Array.from(new Set(doctors.map((doctor) => doctor.specialty)));
    return ["all", ...uniq];
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      const matchSpecialty =
        specialtyFilter === "all" || doctor.specialty === specialtyFilter;
      const term = search.toLowerCase().trim();
      if (!term) return matchSpecialty;
      return (
        matchSpecialty &&
        (doctor.name.toLowerCase().includes(term) ||
          doctor.specialty.toLowerCase().includes(term) ||
          (doctor.bio || "").toLowerCase().includes(term))
      );
    });
  }, [doctors, specialtyFilter, search]);

  async function handleSubmit(formData: FormData) {
    if (!selectedDoctorId) {
      setError("Please choose a doctor before booking.");
      toast.error("Please choose a doctor before booking.");
      return;
    }

    const res = await createAppointment(formData);
    if (res?.error) {
      setError(res.error);
      toast.error(res.error);
    }
  }

  function closeModal() {
    setDoctorModalOpen(false);
    setSearch("");
    setSpecialtyFilter("all");
  }

  return (
    <form action={handleSubmit} className="space-y-8">
      <input type="hidden" name="doctorId" value={selectedDoctorId} />
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-blue-100 bg-white/70 backdrop-blur-sm p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <CalendarIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-wide text-blue-500 font-semibold">
                  Select Date
                </p>
                <h3 className="text-xl font-semibold text-slate-900">
                  Choose the perfect time
                </h3>
                <p className="text-sm text-slate-500">
                  Pick a date and time that works best for your consultation.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <div className="relative">
                  <Input
                    type="date"
                    id="date"
                    name="date"
                    required
                    min={minDate}
                    className="pl-12 h-12 rounded-2xl"
                  />
                  <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
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
                    className="pl-12 h-12 rounded-2xl"
                  />
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-blue-100 bg-white/70 backdrop-blur-sm p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-wide text-slate-500 font-semibold">
                  Consultation Details
                </p>
                <h3 className="text-xl font-semibold text-slate-900">
                  Tell us about your visit
                </h3>
                <p className="text-sm text-slate-500">
                  A short description helps your doctor prepare ahead of time.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Reason for visit</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Describe your symptoms, concerns, or consultation goals..."
                rows={6}
                required
                className="rounded-2xl"
              />
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl border border-blue-100 bg-white/80 backdrop-blur-sm p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Contact Information
                </h3>
                <p className="text-sm text-slate-500">
                  We&apos;ll use this to confirm your appointment.
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>First Name</Label>
                <Input
                  value={contactInfo.firstName}
                  readOnly
                  className="rounded-2xl bg-slate-50"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Last Name</Label>
                <Input
                  value={contactInfo.lastName}
                  readOnly
                  className="rounded-2xl bg-slate-50"
                />
              </div>
            </div>
            <div className="space-y-1.5 mt-4">
              <Label>Email Address</Label>
              <div className="relative">
                <Input
                  value={contactInfo.email}
                  readOnly
                  className="pl-12 rounded-2xl bg-slate-50"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>
            <div className="space-y-1.5 mt-4">
              <Label>Phone Number</Label>
              <div className="relative">
                <Input
                  value={contactInfo.phone || "Not provided"}
                  readOnly
                  className="pl-12 rounded-2xl bg-slate-50"
                />
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-blue-100 bg-white/80 backdrop-blur-sm p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Stethoscope className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Doctor</h3>
                <p className="text-sm text-slate-500">
                  Choose the specialist you want to meet.
                </p>
              </div>
            </div>

            <div className="border border-dashed border-blue-200 rounded-2xl p-4 mb-4 bg-blue-50/40">
              {selectedDoctor ? (
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl overflow-hidden bg-blue-100">
                    <Image
                      src={
                        selectedDoctor.image_url ||
                        "https://placehold.co/80x80?text=Dr"
                      }
                      alt={selectedDoctor.name}
                      width={56}
                      height={56}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-wide text-blue-500 font-semibold">
                      Selected Specialist
                    </p>
                    <p className="text-lg font-semibold text-slate-900">
                      {selectedDoctor.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {selectedDoctor.specialty}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-500 text-sm">
                  No doctor selected yet. Browse our specialists to get started.
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <Button
                type="button"
                onClick={() => setDoctorModalOpen(true)}
                disabled={doctors.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 hover:cursor-pointer"
              >
                {selectedDoctor ? "Change Doctor" : "Browse Doctors"}
              </Button>
              {selectedDoctor && (
                <p className="text-xs text-slate-500 text-center">
                  Prefer someone else? You can always switch doctors here.
                </p>
              )}
              {doctors.length === 0 && (
                <p className="text-xs text-red-500 text-center">
                  No doctors are available right now. Please check back soon.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>

      <div className="rounded-3xl border border-blue-100 bg-white/80 backdrop-blur-sm p-6 shadow-sm">
        <SubmitButton canSubmit={Boolean(selectedDoctorId)} />
      </div>

      {doctorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-900/50"
            onClick={closeModal}
          />
          <div className="relative z-10 w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-blue-100 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-blue-50">
              <div>
                <p className="text-sm uppercase tracking-wide text-blue-500 font-semibold">
                  Our Care Team
                </p>
                <h3 className="text-xl font-semibold text-slate-900">
                  Select a specialist
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="text-slate-500 hover:text-slate-900 hover:cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Input
                    placeholder="Search by name or specialty"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="pl-11 rounded-2xl"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {specialties.map((specialty) => (
                    <button
                      key={specialty}
                      type="button"
                      onClick={() => setSpecialtyFilter(specialty)}
                      className={`px-4 py-2 rounded-full text-sm border ${
                        specialtyFilter === specialty
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-slate-600 border-slate-200"
                      }`}
                    >
                      {specialty === "all" ? "All" : specialty}
                    </button>
                  ))}
                </div>
              </div>

              {filteredDoctors.length === 0 ? (
                <div className="text-center text-slate-500 py-12">
                  No doctors match your search. Try a different specialty or
                  name.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredDoctors.map((doctor) => (
                    <button
                      key={doctor.id}
                      type="button"
                      onClick={() => {
                        setSelectedDoctorId(doctor.id);
                        setError(null);
                        closeModal();
                      }}
                      className={`text-left rounded-2xl border transition shadow-sm hover:shadow-lg p-4 flex gap-4 hover:cursor-pointer ${
                        selectedDoctorId === doctor.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="h-16 w-16 rounded-2xl overflow-hidden bg-blue-100 shrink-0">
                        <Image
                          src={
                            doctor.image_url ||
                            "https://placehold.co/96x96?text=Dr"
                          }
                          alt={doctor.name}
                          width={64}
                          height={64}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm uppercase tracking-wide text-blue-500 font-semibold">
                          {doctor.specialty}
                        </p>
                        <p className="text-lg font-semibold text-slate-900">
                          {doctor.name}
                        </p>
                        <p className="text-sm text-slate-500 line-clamp-2">
                          {doctor.bio ||
                            "Experienced specialist ready to support your care."}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
