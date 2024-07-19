"use client"; // Directive to use client-side JavaScript only
import React, { useEffect, useState } from "react"; // Importing React and hooks for side effects and state management
import { supabase } from "@/lib/supabaseClient"; // Importing supabase client instance for database interactions
import withAuth from "@/lib/auth"; // Importing HOC for authentication
import Link from "next/link"; // Importing Link component from Next.js for client-side navigation
import { useRouter } from "next/navigation"; // Importing useRouter for navigation

// Define a type for the doctor
interface Doctor {
  doctor_id: string;
  name: string;
  email: string;
  specialty: string;
}

const PatientDashboard = () => {
  const router = useRouter(); // Hook to programmatically navigate
  const [linkedDoctors, setLinkedDoctors] = useState<Doctor[]>([]); // State to store linked doctors
  const [loading, setLoading] = useState(true); // State to manage loading status
  const [patientName, setPatientName] = useState(""); // State to store patient name

  useEffect(() => {
    // Function to fetch linked doctors from the database
    const fetchLinkedDoctors = async () => {
      const user = (await supabase.auth.getUser()).data.user; // Getting the current user
      if (user) {
        // Fetching the patient name and ID
        const { data: patientData } = await supabase
          .from("patients")
          .select("patient_id, name")
          .eq("uid", user.id)
          .single();

        if (patientData) {
          setPatientName(patientData.name || ""); // Setting the patient name

          // Fetching the linked doctors for the patient
          const { data: doctorPatientData, error } = await supabase
            .from("doctorpatient")
            .select("doctor_id")
            .eq("patient_id", patientData.patient_id);

          if (doctorPatientData) {
            const doctorIds = doctorPatientData.map((link) => link.doctor_id); // Extracting doctor IDs
            const { data: doctorData } = await supabase
              .from("doctors")
              .select("*")
              .in("doctor_id", doctorIds); // Fetching doctor details
            setLinkedDoctors(doctorData || []); // Setting the state with doctors data
          } else {
            console.error(error);
          }
        }
      }
      setLoading(false); // Setting loading state to false once data is fetched
    };

    fetchLinkedDoctors(); // Calling the function to fetch linked doctors
  }, []);

  if (loading) {
    return <p>Loading...</p>; // Display loading text while data is being fetched
  }

  // Function to handle signout
  const handleSignout = async () => {
    await supabase.auth.signOut(); // Signing out the user
    router.push("/"); // Redirecting to the home page
  };

  return (
    <main className="min-h-screen bg-gray-100 text-black"> {/* Main container with minimum height and background color */}
      <header className="bg-indigo-600 text-white shadow-md py-4"> {/* Header with background color, text color, shadow, and padding */}
        <nav className="container mx-auto flex justify-between items-center px-6"> {/* Navigation container with flex layout and spacing */}
          <div className="text-xl font-bold">Patient Dashboard</div> {/* Title of the dashboard */}
          <ul className="flex space-x-6"> {/* Navigation links with spacing */}
            <li>
              <Link href="/patient/dashboard"> {/* Link to patient dashboard */}
                <span className="hover:text-gray-300">Dashboard</span> {/* Text with hover effect */}
              </Link>
            </li>
            <li>
              <Link href="/patient/dashboard"> {/* Link to patient dashboard */}
                <button className="hover:text-gray-300" onClick={handleSignout}> {/* Button for signout */}
                  Signout
                </button>
              </Link>
            </li>
          </ul>
        </nav>
      </header>
      <section className="container mx-auto py-10 px-6"> {/* Section with padding */}
        <h1 className="text-3xl font-bold mb-6">Welcome {patientName}, to your dashboard</h1> {/* Greeting message with patient name */}
        <div className="bg-white p-6 rounded-lg shadow-md"> {/* Container for linked doctors */}
          <h2 className="text-2xl font-bold mb-4">Your Linked Doctors</h2> {/* Heading for linked doctors */}
          {linkedDoctors.length > 0 ? (
            <ul className="space-y-4"> {/* List of linked doctors */}
              {linkedDoctors.map((doctor) => (
                <li
                  key={doctor.doctor_id}
                  className="p-4 border border-gray-300 rounded-md hover:bg-gray-50 flex justify-between items-center"> {/* List item styling */}
                
                  <div>
                    <div className="font-medium text-lg">{doctor.name}</div> {/* Doctor's name */}
                    <div className="text-gray-600">{doctor.email}</div> {/* Doctor's email */}
                    <div className="text-gray-600">{doctor.specialty}</div> {/* Doctor's specialty */}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No linked doctors found.</p>  /* Message when no linked doctors are found */
          )}
        </div>
      </section>
    </main>
  );
};

export default withAuth(PatientDashboard, 'patient'); // Wrapping the component with authentication HOC
