// pages/doctor/dashboard/linked-patients.tsx
"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import withAuth from '@/lib/auth';
import Link from 'next/link';
import Header from "@/components/Header";

interface Patient {
  patient_id: string;
  name: string;
  email: string;
}

const LinkedPatients = () => {
  const [linkedPatients, setLinkedPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLinkedPatients = async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (user) {
        const { data: doctorData } = await supabase
          .from('doctors')
          .select('doctor_id')
          .eq('uid', user.id)
          .single();

        if (doctorData) {
          const { data, error } = await supabase
            .from('doctorpatient')
            .select('patient_id')
            .eq('doctor_id', doctorData.doctor_id);

          if (data) {
            const patientIds = data.map((link) => link.patient_id);
            const { data: patientData } = await supabase
              .from('patients')
              .select('*')
              .in('patient_id', patientIds);
            setLinkedPatients(patientData || []);
          } else {
            console.error(error);
          }
        }
      }
      setLoading(false);
    };

    fetchLinkedPatients();
  }, []);

  const handleDelete = async (patient_id: string) => {
    setLoading(true);
    const user = (await supabase.auth.getUser()).data.user;
    if (user) {
      const { data: doctorData } = await supabase
        .from('doctors')
        .select('doctor_id')
        .eq('uid', user.id)
        .single();

      if (doctorData) {
        const { error } = await supabase
          .from('doctorpatient')
          .delete()
          .eq('doctor_id', doctorData.doctor_id)
          .eq('patient_id', patient_id);

        if (error) {
          console.error(error);
        } else {
          setLinkedPatients(linkedPatients.filter(patient => patient.patient_id !== patient_id));
        }
      }
    }
    setLoading(false);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <Header />
      <section className="container mx-auto py-10 px-6">
        <h1 className="text-3xl font-bold mb-6 text-black">Linked Patients</h1>
        <div className="bg-white p-6 rounded-lg shadow-md text-black">
          {linkedPatients.length > 0 ? (
            <ul className="space-y-4">
              {linkedPatients.map((patient) => (
                <li
                  key={patient.patient_id}
                  className="p-4 border border-gray-300 rounded-md hover:bg-gray-50 flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium text-lg">{patient.name}</div>
                    <div className="text-gray-600">{patient.email}</div>
                  </div>
                  <button
                    onClick={() => handleDelete(patient.patient_id)}
                    className="ml-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Remove Link
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No linked patients found.</p>
          )}
        </div>
      </section>
    </main>
  );
};

export default withAuth(LinkedPatients, 'doctor');
