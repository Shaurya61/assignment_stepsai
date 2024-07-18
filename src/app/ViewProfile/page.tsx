"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import withAuth from '../../../lib/auth';

type Patient = {
  patient_id: string;
  name: string;
  email: string;
};

const ViewLinkedPatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchLinkedPatients = async () => {
      // Get authenticated user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        console.error("User error:", userError);
        return;
      }

      const user = userData.user;

      // Query the doctors table to get the doctor_id
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('doctor_id')
        .eq('uid', user.id);

      if (doctorError || !doctorData || doctorData.length !== 1) {
        console.error("Doctor query error or no/multiple matching doctor found:", doctorError);
        return;
      }

      const doctor_id = doctorData[0].doctor_id;

      // Fetch linked patients
      const { data, error } = await supabase
        .from('doctorpatient')
        .select('patient_id')
        .eq('doctor_id', doctor_id);

      if (error) {
        setErrorMessage('Failed to fetch linked patients.');
        console.error(error);
        return;
      }

      const patientIds = data.map((link: { patient_id: string }) => link.patient_id);
      const { data: patientData } = await supabase
        .from('patients')
        .select('*')
        .in('patient_id', patientIds);
      setPatients(patientData ?? []);
    };

    fetchLinkedPatients();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Linked Patients</h2>
        </div>
        <div className="mt-8 space-y-6">
          {errorMessage && (
            <div className="mt-4 text-red-600 text-center">
              {errorMessage}
            </div>
          )}
          {patients.length > 0 ? (
            <ul className="list-disc list-inside mt-4 text-black">
              {patients.map((patient) => (
                <li key={patient.patient_id}>{patient.name} ({patient.email})</li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-gray-500">No linked patients found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default withAuth(ViewLinkedPatients);
