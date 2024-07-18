"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import withAuth from "../../../../lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Define a type for the doctor
interface Doctor {
  doctor_id: string;
  name: string;
  email: string;
  specialty: string;
}

const PatientDashboard = () => {
  const router = useRouter();
  const [linkedDoctors, setLinkedDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [patientName, setPatientName] = useState("");

  useEffect(() => {
    const fetchLinkedDoctors = async () => {
      const user = (await supabase.auth.getUser()).data.user;

      if (user) {
        const { data: patientData } = await supabase
          .from("patients")
          .select("name")
          .eq("uid", user.id)
          .single();
        setPatientName(patientData?.name || "");

        const { data: doctorPatientData } = await supabase
          .from("doctorpatient")
          .select("doctor_id")

        if (doctorPatientData) {
          const doctorIds = doctorPatientData.map((link) => link.doctor_id);
          const { data: doctorData } = await supabase
            .from("doctors")
            .select("*")
            .in("doctor_id", doctorIds);
          setLinkedDoctors(doctorData || []);
        }
      }
      setLoading(false);
    };

    fetchLinkedDoctors();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  const handleSignout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-gray-100 text-black">
      <header className="bg-indigo-600 text-white shadow-md py-4">
        <nav className="container mx-auto flex justify-between items-center px-6">
          <div className="text-xl font-bold">Patient Dashboard</div>
          <ul className="flex space-x-6">
            <li>
              <Link href="/patient/dashboard">
                <span className="hover:text-gray-300">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link href="/patient/dashboard">
                <button className="hover:text-gray-300" onClick={handleSignout}>
                  Signout
                </button>
              </Link>
            </li>
          </ul>
        </nav>
      </header>
      <section className="container mx-auto py-10 px-6">
        <h1 className="text-3xl font-bold mb-6">
          Welcome {patientName}, to your dashboard
        </h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Your Linked Doctors</h2>
          {linkedDoctors.length > 0 ? (
            <ul className="space-y-4">
              {linkedDoctors.map((doctor) => (
                <li
                  key={doctor.doctor_id}
                  className="p-4 border border-gray-300 rounded-md hover:bg-gray-50 flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium text-lg">{doctor.name}</div>
                    <div className="text-gray-600">{doctor.email}</div>
                    <div className="text-gray-600">{doctor.specialty}</div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No linked doctors found.</p>
          )}
        </div>
      </section>
    </main>
  );
};

export default withAuth(PatientDashboard);
