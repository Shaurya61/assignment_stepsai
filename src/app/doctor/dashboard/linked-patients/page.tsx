"use client";
import { useEffect, useState } from 'react'; // Importing React hooks for side effects and state management
import { supabase } from '@/lib/supabaseClient'; // Importing supabase client instance for database interactions
import withAuth from '@/lib/auth'; // Importing HOC for authentication
import Link from 'next/link'; // Importing Link component from Next.js for client-side navigation

// Define a type for the patient
interface Patient {
  patient_id: string;
  name: string;
  email: string;
}

const LinkedPatients = () => {
  const [linkedPatients, setLinkedPatients] = useState<Patient[]>([]); // State to store linked patients
  const [loading, setLoading] = useState(true); // State to manage loading status

  useEffect(() => {
    // Function to fetch linked patients from the database
    const fetchLinkedPatients = async () => {
      const user = (await supabase.auth.getUser()).data.user; // Getting the current user
      if (user) {
        // Fetching the doctor's ID from the database
        const { data: doctorData } = await supabase
          .from('doctors')
          .select('doctor_id')
          .eq('uid', user.id)
          .single();

        if (doctorData) {
          // Fetching the patient IDs linked to the doctor
          const { data, error } = await supabase
            .from('doctorpatient')
            .select('patient_id')
            .eq('doctor_id', doctorData.doctor_id);

          if (data) {
            // Fetching patient details based on patient IDs
            const patientIds = data.map((link) => link.patient_id);
            const { data: patientData } = await supabase
              .from('patients')
              .select('*')
              .in('patient_id', patientIds);
            setLinkedPatients(patientData || []); // Setting the state with patient data
          } else {
            console.error(error); // Logging error if fetching patient IDs fails
          }
        }
      }
      setLoading(false); // Setting loading state to false once data is fetched
    };

    fetchLinkedPatients(); // Calling the function to fetch linked patients
  }, []);

  // Function to handle deleting a linked patient
  const handleDelete = async (patient_id: string) => {
    setLoading(true); // Setting loading state to true while processing deletion
    const user = (await supabase.auth.getUser()).data.user; // Getting the current user
    if (user) {
      // Fetching the doctor's ID from the database
      const { data: doctorData } = await supabase
        .from('doctors')
        .select('doctor_id')
        .eq('uid', user.id)
        .single();

      if (doctorData) {
        // Deleting the patient from the doctor's linked patients
        const { error } = await supabase
          .from('doctorpatient')
          .delete()
          .eq('doctor_id', doctorData.doctor_id)
          .eq('patient_id', patient_id);

        if (error) {
          console.error(error); // Logging error if deletion fails
        } else {
          // Updating the state by removing the deleted patient
          setLinkedPatients(linkedPatients.filter(patient => patient.patient_id !== patient_id));
        }
      }
    }
    setLoading(false); // Setting loading state to false once deletion is processed
  };

  if (loading) {
    return <p>Loading...</p>; // Display loading text while data is being fetched
  }

  return (
    <main className="min-h-screen bg-gray-100"> {/* Main container with minimum height and background color */}
      <header className="bg-indigo-600 text-white shadow-md py-4"> {/* Header with background color, text color, shadow, and padding */}
        <nav className="container mx-auto flex justify-between items-center px-6"> {/* Navigation container with flex layout and spacing */}
          <div className="text-xl font-bold">Dashboard</div> {/* Title of the dashboard */}
          <ul className="flex space-x-6"> {/* Navigation links with spacing */}
            <li>
              <Link href="/doctor/dashboard"> {/* Link to dashboard */}
                <span className="hover:text-gray-300">Dashboard</span> {/* Text with hover effect */}
              </Link>
            </li>
            <li>
              <Link href="/doctor/dashboard/uploaded-pdf"> {/* Link to uploaded PDFs page */}
                <span className="hover:text-gray-300">PDF Uploads</span> {/* Text with hover effect */}
              </Link>
            </li>
            <li>
              <Link href="/doctor/dashboard/linked-patients"> {/* Link to linked patients page */}
                <span className="hover:text-gray-300">All Linked Patients</span> {/* Text with hover effect */}
              </Link>
            </li>
          </ul>
        </nav>
      </header>
      <section className="container mx-auto py-10 px-6"> {/* Section with padding */}
        <h1 className="text-3xl font-bold mb-6 text-black">Linked Patients</h1> {/* Heading for linked patients */}
        <div className="bg-white p-6 rounded-lg shadow-md text-black"> {/* Container for patient list */}
          {linkedPatients.length > 0 ? (
            <ul className="space-y-4"> {/* List of linked patients */}
              {linkedPatients.map((patient) => (
                <li
                  key={patient.patient_id} // Unique key for each list item
                  className="p-4 border border-gray-300 rounded-md hover:bg-gray-50 flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium text-lg">{patient.name}</div> {/* Patient's name */}
                    <div className="text-gray-600">{patient.email}</div> {/* Patient's email */}
                  </div>
                  <button
                    onClick={() => handleDelete(patient.patient_id)} // Handling patient deletion
                    className="ml-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No linked patients found.</p> // Message when no patients are linked
          )}
        </div>
      </section>
    </main>
  );
};

export default withAuth(LinkedPatients, 'doctor'); // Wrapping the component with authentication HOC
