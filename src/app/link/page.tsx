"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import withAuth from '../../../lib/auth';

type Doctor = {
  doctor_id: string;
  name: string;
};

type Patient = {
  patient_id: string;
  name: string;
  email: string; // Assuming email is part of the patient data
};

const LinkProfiles = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [linkedPatients, setLinkedPatients] = useState<Patient[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: doctorsData } = await supabase.from('doctors').select('*');
      const { data: patientsData } = await supabase.from('patients').select('*');
      setDoctors(doctorsData ?? []);
      setPatients(patientsData ?? []);
    };
    fetchData();
  }, []);

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
    if (selectedDoctor && selectedPatient) {
      const { error } = await supabase.from('doctorpatient').insert({
        doctor_id: selectedDoctor,
        patient_id: selectedPatient,
      });
      if (error) {
        setErrorMessage('Failed to link profiles. Please try again.');
        setSuccessMessage(null);
        console.error(error);
      } else {
        setSuccessMessage('Successfully linked doctor and patient profiles.');
        setErrorMessage(null);
        fetchLinkedPatients(selectedDoctor);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Link Doctor and Patient Profiles</h2>
        </div>
        <div className="mt-8 space-y-6">
          <div>
            <label htmlFor="doctor" className="block text-sm font-medium text-gray-700">
              Select Doctor
            </label>
            <select
              id="doctor"
              onChange={(e) => {
                setSelectedDoctor(e.target.value);
                fetchLinkedPatients(e.target.value);
              }}
              className="block w-full px-3 py-2 border rounded-md text-black"
            >
              <option value="">Select Doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.doctor_id} value={doctor.doctor_id}>
                  {doctor.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="patient" className="block text-sm font-medium text-gray-700">
              Select Patient
            </label>
            <select
              id="patient"
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="block w-full px-3 py-2 border rounded-md mt-4 text-black"
            >
              <option value="">Select Patient</option>
              {patients.map((patient) => (
                <option key={patient.patient_id} value={patient.patient_id}>
                  {patient.name}
                </option>
              ))}
            </select>
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
          {selectedDoctor && (
            <button
              onClick={() => fetchLinkedPatients(selectedDoctor)}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 mt-4"
            >
              View Linked Patients
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default withAuth(LinkProfiles);
