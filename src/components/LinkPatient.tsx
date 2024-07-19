"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import withAuth from '@/lib/auth';

type Patient = {
  patient_id: string;
  name: string;
  email: string;
};

const LinkPatient = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [linkedPatients, setLinkedPatients] = useState<Patient[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [doctorId, setDoctorId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (user) {
        const { data: doctorData } = await supabase
          .from('doctors')
          .select('doctor_id')
          .eq('uid', user.id)
          .single();
        setDoctorId(doctorData?.doctor_id);
        fetchLinkedPatients(doctorData?.doctor_id);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const fetchPatients = async () => {
        const { data: patientsData } = await supabase
          .from('patients')
          .select('*')
          .ilike('name', `%${searchQuery}%`)
          .or(`email.ilike.%${searchQuery}%`);
        setPatients(patientsData ?? []);
      };
      fetchPatients();
    } else {
      setPatients([]);
    }
  }, [searchQuery]);

  const fetchLinkedPatients = async (doctorId: string) => {
    const { data, error } = await supabase
      .from('doctorpatient')
      .select('patient_id')
      .eq('doctor_id', doctorId);

    if (data) {
      const patientIds = data.map((link: { patient_id: string }) => link.patient_id);
      const { data: patientData } = await supabase
        .from('patients')
        .select('*')
        .in('patient_id', patientIds);
      setLinkedPatients(patientData ?? []);
    } else {
      console.error(error);
    }
  };

  const handleLink = async () => {
    if (doctorId && selectedPatient) {
      const { error } = await supabase.from('doctorpatient').insert({
        doctor_id: doctorId,
        patient_id: selectedPatient.patient_id,
      });
      if (error) {
        setErrorMessage('Failed to link profiles. Please try again.');
        setSuccessMessage(null);
        console.error(error);
      } else {
        setSuccessMessage('Successfully linked doctor and patient profiles.');
        setErrorMessage(null);
        fetchLinkedPatients(doctorId);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-center text-2xl font-extrabold text-gray-900">Link Doctor and Patient Profiles</h2>
      </div>
      <div className="space-y-6">
        <div>
          <label htmlFor="patient-search" className="block text-sm font-medium text-gray-700">
            Enter Patient Name or Email
          </label>
          <input
            id="patient-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full px-3 py-2 border rounded-md mt-4 text-black"
            placeholder="Type name or email"
          />
          {patients.length > 0 && (
            <ul className="border border-gray-300 mt-2 rounded-md max-h-40 overflow-y-auto">
              {patients.map((patient) => (
                <li
                  key={patient.patient_id}
                  onClick={() => {
                    setSelectedPatient(patient);
                    setSearchQuery(`${patient.name} (${patient.email})`);
                    setPatients([]);
                  }}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-200 text-black"
                >
                  {patient.name} ({patient.email})
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <button
            onClick={handleLink}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 mt-4"
          >
            Link Profiles
          </button>
        </div>
        {successMessage && (
          <div className="mt-4 text-green-600 text-center">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mt-4 text-red-600 text-center">
            {errorMessage}
          </div>
        )}
        {linkedPatients.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-black">Linked Patients:</h3>
            <ul className="list-disc list-inside mt-4 text-black">
              {linkedPatients.map((patient) => (
                <li key={patient.patient_id}>{patient.name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default withAuth(LinkPatient, 'doctor');
