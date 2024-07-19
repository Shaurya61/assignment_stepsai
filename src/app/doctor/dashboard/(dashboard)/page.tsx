"use client";
import LinkPatient from "@/components/LinkPatient"; // Importing the LinkPatient component
import React from "react";
import Link from "next/link"; // Importing Link component from Next.js for client-side navigation
import Upload from "@/components/Upload"; // Importing the Upload component
import { supabase } from "@/lib/supabaseClient"; // Importing supabase client instance for authentication
import { useRouter } from "next/navigation"; // Importing useRouter for navigation

const Dashboard = () => {
  const router = useRouter(); // Initializing router for navigation

  // Function to handle user signout
  const handleSignout = async () => {
    const { error } = await supabase.auth.signOut(); // Signing out the user
    router.push("/"); // Redirecting to the home page after signout
    if (error) console.error("Signout error:", error); // Logging error if signout fails
  };

  return (
    <main className="min-h-screen bg-gray-100 text-black">
      {/* Main container with minimum height and background color */}
      <header className="bg-indigo-600 text-white shadow-md py-4">
        {/* Header with background color, text color, shadow, and padding */}
        <nav className="container mx-auto flex justify-between items-center px-6">
  
          {/* Navigation container with flex layout and spacing */}
          <div className="text-xl font-bold">Dashboard</div>
          {/* Title of the dashboard */}
          <ul className="flex space-x-6">
           
            {/* Navigation links with spacing */}
            <li>
              <Link href="/doctor/dashboard/uploaded-pdf">
              
                {/* Link to uploaded PDFs page */}
                <span className="hover:text-gray-300">Uploaded Pdfs</span>
                {/* Text with hover effect */}
              </Link>
            </li>
            <li>
              <Link href="/doctor/dashboard/linked-patients">
                {/* Link to linked patients page */}
                <span className="hover:text-gray-300">
                  All Linked Patients
                </span>
                {/* Text with hover effect */}
              </Link>
            </li>
            <li>
              <span className="hover:text-gray-300" onClick={handleSignout}>
                Signout
              </span>
            </li>
          </ul>
        </nav>
      </header>
      <section className="container mx-auto py-10 px-6">
        
        {/* Section with padding */}
        <h1 className="text-3xl font-bold mb-6">
          Welcome to your dashboard
        </h1>
        {/* Welcome heading */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Grid layout for responsive design */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            
            {/* Container for Upload component */}
            <Upload />
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            
            {/* Container for LinkPatient component */}
            <LinkPatient />
          </div>
        </div>
      </section>
    </main>
  );
};

export default Dashboard; // Exporting the Page component
