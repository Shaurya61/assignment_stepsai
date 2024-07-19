"use client"; // Directive to use client-side JavaScript only
import { useEffect, useState } from 'react'; // Importing React hooks for side effects and state management
import { supabase } from '@/lib/supabaseClient'; // Importing supabase client instance for database interactions
import withAuth from '@/lib/auth'; // Importing HOC for authentication
import Link from 'next/link'; // Importing Link component from Next.js for client-side navigation

// Define a type for the PDF
interface PDF {
  pdfid: string;
  filepath: string;
  uploaddate: string;
  signedURL?: string; // Added signedURL to the PDF interface
}

const UploadedPDFs = () => {
  const [pdfs, setPdfs] = useState<PDF[]>([]); // State to store the list of PDFs
  const [loading, setLoading] = useState(true); // State to manage loading status

  useEffect(() => {
    // Function to fetch PDFs from the database
    const fetchPDFs = async () => {
      const user = (await supabase.auth.getUser()).data.user; // Getting the current user
      if (user) {
        // Fetching the doctor's ID from the database
        const { data: doctorData } = await supabase
          .from('doctors')
          .select('doctor_id')
          .eq('uid', user.id)
          .single();

        if (doctorData) {
          // Fetching the list of PDFs associated with the doctor
          const { data, error } = await supabase
            .from('pdfs')
            .select('*')
            .eq('doctor_id', doctorData.doctor_id);

          if (error) {
            console.error(error); // Logging error if fetching PDFs fails
          } else {
            // Generating signed URLs for each PDF
            const pdfsWithSignedUrls = await Promise.all(data.map(async (pdf) => {
              const { data: signedData, error: signedError } = await supabase
                .storage
                .from('pdfs') // Replace with your bucket name
                .createSignedUrl(pdf.filepath, 60); // URL valid for 60 seconds

              if (signedError) {
                console.error(signedError); // Logging error if URL generation fails
                return pdf; // Returning the original PDF if there's an error
              } else {
                return {
                  ...pdf,
                  signedURL: signedData.signedUrl, // Adding the signed URL to the PDF object
                };
              }
            }));
            setPdfs(pdfsWithSignedUrls || []); // Setting the state with PDFs including signed URLs
          }
        }
      }
      setLoading(false); // Setting loading state to false once data is fetched
    };

    fetchPDFs(); // Calling the function to fetch PDFs
  }, []);

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
              <Link href="/doctor/dashboard/uploaded-pdf"> {/* Link to PDF uploads page */}
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
        <h1 className="text-3xl font-bold mb-6 text-black">Uploaded PDFs</h1> {/* Heading for uploaded PDFs */}
        <div className="bg-white p-6 rounded-lg shadow-md text-black"> {/* Container for PDF list */}
          {pdfs.length > 0 ? (
            <ul className="space-y-4"> {/* List of uploaded PDFs */}
              {pdfs.map((pdf) => (
                <li key={pdf.pdfid} className="p-4 border border-gray-300 rounded-md hover:bg-gray-50"> {/* List item for each PDF */}
                  <a href={pdf.signedURL} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                    {pdf.filepath.split('/').pop()} {/* Displaying the file name */}
                  </a>
                  <div className="text-gray-600">Uploaded on: {new Date(pdf.uploaddate).toLocaleDateString()}</div> {/* Displaying upload date */}
                </li>
              ))}
            </ul>
          ) : (
            <p>No PDFs uploaded yet.</p> /* Message when no PDFs are uploaded */
          )}
        </div>
      </section>
    </main>
  );
};

export default withAuth(UploadedPDFs, 'doctor'); // Wrapping the component with authentication HOC
