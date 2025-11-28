import { getDoctorById, getDoctors } from "../actions";
import BookingForm from "./booking-form";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

function splitName(name: string | null | undefined) {
  if (!name) return { firstName: "", lastName: "" };
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export default async function BookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const doctor = await getDoctorById(id);

  if (!doctor) {
    redirect("/book");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, doctors] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", user.id)
      .maybeSingle(),
    getDoctors(),
  ]);

  const { firstName, lastName } = splitName(
    profile?.full_name || user.user_metadata?.full_name
  );

  const contactInfo = {
    firstName: firstName || "Friend",
    lastName,
    email: user.email || "",
    phone: profile?.phone || "",
  };

  const minDate = new Date();
  minDate.setHours(0, 0, 0, 0);
  const minDateStr = minDate.toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 via-white to-white py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <p className="text-sm tracking-[0.35em] uppercase text-blue-500 font-semibold">
            Preferred Specialist
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
            You&apos;re booking with {doctor.name}
          </h1>
          <p className="text-base text-slate-500 max-w-2xl mx-auto">
            {doctor.specialty} &bull; You can still switch to another doctor
            inside the form below if needed.
          </p>
        </div>

        <BookingForm
          doctors={doctors}
          minDate={minDateStr}
          contactInfo={contactInfo}
          initialDoctorId={doctor.id}
        />
      </div>
    </div>
  );
}
